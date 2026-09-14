import { supabase } from "@/integrations/supabase/client";

export type LocalProfile = DatabaseProfile;

export interface LocalEvent {
  id: string;
  title: string;
  description: string | null;
  category: string;
  date: string;
  time: string;
  venue: string;
  price: number;
  banner_image: string | null;
  created_by: string | null;
  total_seats: number;
  seats_remaining: number;
  trending: boolean | null;
  status: string;
  visibility: string;
  university_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface LocalRegistration {
  id: string;
  user_id: string;
  event_id: string;
  ticket_id: string;
  qr_code: string | null;
  status: string;
  created_at: string;
}

export interface LocalScan {
  id: string;
  event_id: string;
  ticket_id: string;
  scanned_by: string | null;
  scanned_at: string;
}

type DatabaseProfile = {
  id: string;
  email: string | null;
  name: string | null;
  role: "student" | "organisation";
  college: string | null;
  department: string | null;
  year: string | null;
  profile_image: string | null;
  preferences: string[] | null;
  created_at: string;
  updated_at: string;
};

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

export async function getProfile(userId: string): Promise<LocalProfile | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  throwIfError(error);
  return data;
}

export async function updateProfile(userId: string, updates: Partial<LocalProfile>): Promise<LocalProfile> {
  const { data, error } = await supabase.from("profiles").update(updates).eq("id", userId).select("*").single();
  throwIfError(error);
  return data;
}

export async function getAllEvents(): Promise<LocalEvent[]> {
  const { data, error } = await supabase.from("events").select("*").order("date", { ascending: true });
  throwIfError(error);
  return data ?? [];
}

export async function getEvent(eventId: string): Promise<LocalEvent | null> {
  const { data, error } = await supabase.from("events").select("*").eq("id", eventId).maybeSingle();
  throwIfError(error);
  return data;
}

export async function getEventsByCreator(userId: string): Promise<LocalEvent[]> {
  const { data, error } = await supabase.from("events").select("*").eq("created_by", userId).order("date", { ascending: true });
  throwIfError(error);
  return data ?? [];
}

export async function createEvent(event: Omit<LocalEvent, "id" | "created_at" | "updated_at">): Promise<LocalEvent> {
  const { data, error } = await supabase.from("events").insert(event).select("*").single();
  throwIfError(error);
  return data;
}

export async function getRegistrations(userId: string): Promise<LocalRegistration[]> {
  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  throwIfError(error);
  return data ?? [];
}

export async function getRegistrationsByEvent(eventId: string): Promise<LocalRegistration[]> {
  const { data, error } = await supabase.from("registrations").select("*").eq("event_id", eventId);
  throwIfError(error);
  return data ?? [];
}

export async function getRegistrationCountByEvent(eventId: string): Promise<number> {
  const { count, error } = await supabase
    .from("registrations")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("status", "Confirmed");
  throwIfError(error);
  return count ?? 0;
}

export async function registerForEvent(eventId: string): Promise<LocalRegistration> {
  const { data, error } = await supabase.rpc("register_for_event", { p_event_id: eventId });
  throwIfError(error);
  if (!data) throw new Error("Registration did not return a ticket");
  return data as LocalRegistration;
}

export async function cancelRegistration(registrationId: string): Promise<LocalRegistration> {
  const { data, error } = await supabase.rpc("cancel_registration", { p_registration_id: registrationId });
  throwIfError(error);
  if (!data) throw new Error("Cancellation did not return a registration");
  return data as LocalRegistration;
}

export async function getScans(eventId: string, ticketId: string): Promise<LocalScan[]> {
  const { data, error } = await supabase
    .from("event_scans")
    .select("*")
    .eq("event_id", eventId)
    .eq("ticket_id", ticketId);
  throwIfError(error);
  return data ?? [];
}

export async function createScan(scan: Omit<LocalScan, "id" | "scanned_at">): Promise<LocalScan> {
  const { data, error } = await supabase.from("event_scans").insert(scan).select("*").single();
  throwIfError(error);
  return data;
}

export async function getRegistrationWithProfile(
  ticketId: string,
  eventId: string,
): Promise<(LocalRegistration & { profileName: string }) | null> {
  const { data, error } = await supabase
    .from("registrations")
    .select("*, profiles(name)")
    .eq("ticket_id", ticketId)
    .eq("event_id", eventId)
    .maybeSingle();
  throwIfError(error);
  if (!data) return null;
  const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
  return { ...data, profileName: profile?.name ?? "Attendee" };
}
