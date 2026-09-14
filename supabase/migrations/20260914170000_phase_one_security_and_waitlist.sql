-- Phase I domain and security hardening.

CREATE TABLE IF NOT EXISTS public.universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email_domains TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.university_memberships (
  university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  membership_role TEXT NOT NULL DEFAULT 'student'
    CHECK (membership_role IN ('student', 'administrator')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (university_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.event_staff (
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.waitlist_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  position BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES public.universities(id),
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'pending_review', 'published', 'rejected', 'cancelled')),
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'public'
    CHECK (visibility IN ('public', 'university_only', 'invite_only'));

DROP POLICY IF EXISTS "Anyone can read events" ON public.events;
CREATE POLICY "Published events are discoverable" ON public.events
  FOR SELECT USING (status = 'published' OR created_by = auth.uid());

DROP POLICY IF EXISTS "Organisations can create events" ON public.events;
CREATE POLICY "Verified users can submit event drafts" ON public.events
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND status IN ('draft', 'pending_review')
  );

DROP POLICY IF EXISTS "Organisations can update own events" ON public.events;
CREATE POLICY "Creators can edit event drafts" ON public.events
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid() AND status IN ('draft', 'pending_review'));

ALTER TABLE public.university_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their university memberships"
  ON public.university_memberships FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Event owners can manage event staff"
  ON public.event_staff FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = event_staff.event_id AND events.created_by = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = event_staff.event_id AND events.created_by = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert own registrations" ON public.registrations;

DROP POLICY IF EXISTS "Orgs can insert scans" ON public.event_scans;
CREATE POLICY "Assigned staff can insert scans" ON public.event_scans
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.event_staff
    WHERE event_staff.event_id = event_scans.event_id
      AND event_staff.user_id = auth.uid()
  ));

CREATE POLICY "Users can read their waitlist entries"
  ON public.waitlist_entries FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.register_for_event(p_event_id UUID)
RETURNS public.registrations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  existing_registration public.registrations;
  created_registration public.registrations;
  event_row public.events;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO event_row
  FROM public.events
  WHERE id = p_event_id
    AND status = 'published'
  FOR UPDATE;

  IF event_row.id IS NULL THEN
    RAISE EXCEPTION 'Event is not available';
  END IF;

  SELECT * INTO existing_registration
  FROM public.registrations
  WHERE event_id = p_event_id AND user_id = current_user_id;

  IF existing_registration.id IS NOT NULL THEN
    RETURN existing_registration;
  END IF;

  IF event_row.seats_remaining <= 0 THEN
    INSERT INTO public.waitlist_entries (event_id, user_id, position)
    SELECT p_event_id, current_user_id, COALESCE(MAX(position), 0) + 1
    FROM public.waitlist_entries
    WHERE event_id = p_event_id
    ON CONFLICT (event_id, user_id) DO NOTHING;
    INSERT INTO public.registrations (user_id, event_id, ticket_id, qr_code, status)
    VALUES (
      current_user_id,
      p_event_id,
      'WAIT-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)),
      NULL,
      'Waitlisted'
    )
    RETURNING * INTO created_registration;
    RETURN created_registration;
  END IF;

  UPDATE public.events
  SET seats_remaining = seats_remaining - 1
  WHERE id = p_event_id;

  INSERT INTO public.registrations (user_id, event_id, ticket_id, qr_code, status)
  VALUES (
    current_user_id,
    p_event_id,
    'TKT-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)),
    'campusdistrict://ticket/' || replace(gen_random_uuid()::text, '-', ''),
    'Confirmed'
  )
  RETURNING * INTO created_registration;

  RETURN created_registration;
END;
$$;

REVOKE ALL ON FUNCTION public.register_for_event(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_for_event(UUID) TO authenticated;
REVOKE ALL ON FUNCTION public.decrement_seats(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.decrement_seats(UUID) FROM authenticated;

CREATE OR REPLACE FUNCTION public.cancel_registration(p_registration_id UUID)
RETURNS public.registrations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  cancelled_registration public.registrations;
  promoted_registration public.registrations;
  next_waitlist public.waitlist_entries;
  was_confirmed BOOLEAN;
BEGIN
  SELECT * INTO cancelled_registration
  FROM public.registrations
  WHERE id = p_registration_id AND user_id = current_user_id
  FOR UPDATE;

  IF cancelled_registration.id IS NULL THEN
    RAISE EXCEPTION 'Registration not found';
  END IF;

  IF cancelled_registration.status = 'Cancelled' THEN
    RETURN cancelled_registration;
  END IF;

  was_confirmed := cancelled_registration.status = 'Confirmed';

  UPDATE public.registrations
  SET status = 'Cancelled'
  WHERE id = p_registration_id
  RETURNING * INTO cancelled_registration;

  IF was_confirmed THEN
    UPDATE public.events
    SET seats_remaining = seats_remaining + 1
    WHERE id = cancelled_registration.event_id
      AND id = cancelled_registration.event_id;
  END IF;

  SELECT * INTO next_waitlist
  FROM public.waitlist_entries
  WHERE event_id = cancelled_registration.event_id
  ORDER BY position ASC, created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF next_waitlist.id IS NOT NULL THEN
    UPDATE public.registrations
    SET status = 'Confirmed',
        ticket_id = 'TKT-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)),
        qr_code = 'campusdistrict://ticket/' || replace(gen_random_uuid()::text, '-', '')
    WHERE event_id = next_waitlist.event_id
      AND user_id = next_waitlist.user_id
      AND status = 'Waitlisted'
    RETURNING * INTO promoted_registration;

    DELETE FROM public.waitlist_entries WHERE id = next_waitlist.id;
    UPDATE public.events SET seats_remaining = GREATEST(seats_remaining - 1, 0)
      WHERE id = cancelled_registration.event_id;
  END IF;

  RETURN cancelled_registration;
END;
$$;

REVOKE ALL ON FUNCTION public.cancel_registration(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cancel_registration(UUID) TO authenticated;
