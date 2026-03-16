
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('student', 'organisation');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  role app_role NOT NULL DEFAULT 'student',
  college TEXT,
  department TEXT,
  year TEXT,
  profile_image TEXT,
  preferences TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone authenticated can read all profiles, users can update own
CREATE POLICY "Anyone can read profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  venue TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  banner_image TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  total_seats INTEGER NOT NULL DEFAULT 100,
  seats_remaining INTEGER NOT NULL DEFAULT 100,
  trending BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Events: anyone can read, organisations can insert/update/delete their own
CREATE POLICY "Anyone can read events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Organisations can create events" ON public.events FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'organisation')
);
CREATE POLICY "Organisations can update own events" ON public.events FOR UPDATE TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Organisations can delete own events" ON public.events FOR DELETE TO authenticated USING (created_by = auth.uid());

-- Create registrations table
CREATE TABLE public.registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  ticket_id TEXT NOT NULL,
  qr_code TEXT,
  status TEXT NOT NULL DEFAULT 'Confirmed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Registrations: users can read own, insert own; orgs can read registrations for their events
CREATE POLICY "Users can read own registrations" ON public.registrations FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Orgs can read event registrations" ON public.registrations FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.events WHERE events.id = event_id AND events.created_by = auth.uid())
);
CREATE POLICY "Users can insert own registrations" ON public.registrations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Create event_scans table
CREATE TABLE public.event_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  ticket_id TEXT NOT NULL,
  scanned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, ticket_id)
);

ALTER TABLE public.event_scans ENABLE ROW LEVEL SECURITY;

-- Scans: orgs can insert and read for their events
CREATE POLICY "Orgs can insert scans" ON public.event_scans FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.events WHERE events.id = event_id AND events.created_by = auth.uid())
);
CREATE POLICY "Orgs can read scans" ON public.event_scans FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.events WHERE events.id = event_id AND events.created_by = auth.uid())
);

-- Auto-create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RPC to decrement seats atomically
CREATE OR REPLACE FUNCTION public.decrement_seats(p_event_id UUID)
RETURNS INTEGER AS $$
DECLARE
  remaining INTEGER;
BEGIN
  UPDATE public.events
  SET seats_remaining = seats_remaining - 1
  WHERE id = p_event_id AND seats_remaining > 0
  RETURNING seats_remaining INTO remaining;
  
  IF remaining IS NULL THEN
    RAISE EXCEPTION 'No seats available';
  END IF;
  
  RETURN remaining;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for event banners
INSERT INTO storage.buckets (id, name, public) VALUES ('event-banners', 'event-banners', true);

CREATE POLICY "Anyone can view event banners" ON storage.objects FOR SELECT USING (bucket_id = 'event-banners');
CREATE POLICY "Authenticated users can upload event banners" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'event-banners');
CREATE POLICY "Users can update own event banners" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'event-banners');
