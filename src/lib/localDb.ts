// localStorage-based database replacement for offline use

export interface LocalProfile {
  id: string;
  email: string;
  name: string;
  role: "student" | "organisation";
  college: string | null;
  department: string | null;
  year: string | null;
  profile_image: string | null;
  preferences: string[] | null;
  created_at: string;
  updated_at: string;
}

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

function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

const KEYS = {
  profiles: "cd_profiles",
  events: "cd_events",
  registrations: "cd_registrations",
  scans: "cd_scans",
  session: "cd_session",
};

// --- Seed data ---
const seedEvents: LocalEvent[] = [
  { id: "evt-001", title: "TechXplore 2026", description: "The biggest tech symposium featuring AI, blockchain, and quantum computing talks from industry leaders.", category: "Tech", date: "2026-02-22", time: "10:00 AM", venue: "Main Auditorium, Block A", price: 0, banner_image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80", created_by: null, total_seats: 500, seats_remaining: 234, trending: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "evt-002", title: "Rhythm & Blues Night", description: "An electrifying evening of live music performances by campus bands and special guest artists.", category: "Cultural", date: "2026-02-20", time: "6:00 PM", venue: "Open Air Theatre", price: 149, banner_image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80", created_by: null, total_seats: 300, seats_remaining: 87, trending: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "evt-003", title: "Hackathon: Code Sprint", description: "24-hour hackathon with prizes worth ₹1,00,000. Build innovative solutions for real-world problems.", category: "Hackathons", date: "2026-02-25", time: "9:00 AM", venue: "Innovation Lab, Block C", price: 0, banner_image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80", created_by: null, total_seats: 200, seats_remaining: 42, trending: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "evt-004", title: "Inter-College Cricket Tournament", description: "Annual cricket tournament with teams from 16 colleges competing for the championship trophy.", category: "Sports", date: "2026-03-01", time: "8:00 AM", venue: "Sports Ground", price: 0, banner_image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80", created_by: null, total_seats: 1000, seats_remaining: 650, trending: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "evt-005", title: "UI/UX Design Workshop", description: "Hands-on workshop on Figma, design systems, and user research methodologies.", category: "Workshops", date: "2026-02-19", time: "2:00 PM", venue: "Seminar Hall 2", price: 99, banner_image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&q=80", created_by: null, total_seats: 60, seats_remaining: 12, trending: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "evt-006", title: "Spring Fest 2026", description: "The annual college festival with performances, food stalls, competitions, and celebrity appearances.", category: "Fests", date: "2026-03-10", time: "10:00 AM", venue: "Entire Campus", price: 299, banner_image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80", created_by: null, total_seats: 2000, seats_remaining: 1200, trending: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "evt-007", title: "Photography Walk", description: "Campus photography walk with professional photographers. Learn composition and lighting techniques.", category: "Workshops", date: "2026-02-21", time: "4:00 PM", venue: "Meet at Main Gate", price: 0, banner_image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&q=80", created_by: null, total_seats: 30, seats_remaining: 8, trending: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "evt-008", title: "Startup Pitch Competition", description: "Pitch your startup idea to a panel of investors and industry mentors. Win seed funding!", category: "Tech", date: "2026-02-28", time: "11:00 AM", venue: "Business School Auditorium", price: 0, banner_image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80", created_by: null, total_seats: 150, seats_remaining: 95, trending: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "evt-009", title: "Stand-Up Comedy Night", description: "Campus comedy night featuring student comedians and a surprise professional act.", category: "Cultural", date: "2026-02-23", time: "7:30 PM", venue: "Amphitheatre", price: 49, banner_image: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800&q=80", created_by: null, total_seats: 250, seats_remaining: 130, trending: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "evt-010", title: "Badminton Championship", description: "Singles and doubles badminton championship. Open for all departments.", category: "Sports", date: "2026-02-24", time: "9:00 AM", venue: "Indoor Sports Complex", price: 0, banner_image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80", created_by: null, total_seats: 64, seats_remaining: 20, trending: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

function initEvents() {
  const existing = getItem<LocalEvent[]>(KEYS.events, []);
  if (existing.length === 0) {
    setItem(KEYS.events, seedEvents);
    return seedEvents;
  }
  return existing;
}

// --- Auth ---
export function signUp(email: string, password: string, role: "student" | "organisation", name: string): { profile: LocalProfile } | { error: string } {
  const profiles = getItem<(LocalProfile & { password: string })[]>(KEYS.profiles, []);
  if (profiles.find((p) => p.email === email)) {
    return { error: "An account with this email already exists" };
  }
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const newProfile: LocalProfile & { password: string } = {
    id, email, name, role, password,
    college: null, department: null, year: null,
    profile_image: null, preferences: null,
    created_at: now, updated_at: now,
  };
  profiles.push(newProfile);
  setItem(KEYS.profiles, profiles);
  setItem(KEYS.session, { userId: id });
  const { password: _, ...profile } = newProfile;
  return { profile };
}

export function signIn(email: string, password: string): { profile: LocalProfile } | { error: string } {
  const profiles = getItem<(LocalProfile & { password: string })[]>(KEYS.profiles, []);
  const found = profiles.find((p) => p.email === email);
  if (!found) return { error: "No account found with this email" };
  if (found.password !== password) return { error: "Invalid password" };
  setItem(KEYS.session, { userId: found.id });
  const { password: _, ...profile } = found;
  return { profile };
}

export function signOut() {
  localStorage.removeItem(KEYS.session);
}

export function getSession(): { userId: string } | null {
  return getItem<{ userId: string } | null>(KEYS.session, null);
}

export function getProfile(userId: string): LocalProfile | null {
  const profiles = getItem<(LocalProfile & { password: string })[]>(KEYS.profiles, []);
  const found = profiles.find((p) => p.id === userId);
  if (!found) return null;
  const { password: _, ...profile } = found;
  return profile;
}

export function updateProfile(userId: string, updates: Partial<LocalProfile>): LocalProfile | null {
  const profiles = getItem<(LocalProfile & { password: string })[]>(KEYS.profiles, []);
  const idx = profiles.findIndex((p) => p.id === userId);
  if (idx === -1) return null;
  profiles[idx] = { ...profiles[idx], ...updates, updated_at: new Date().toISOString() };
  setItem(KEYS.profiles, profiles);
  const { password: _, ...profile } = profiles[idx];
  return profile;
}

// --- Events ---
export function getAllEvents(): LocalEvent[] {
  return initEvents();
}

export function getEvent(eventId: string): LocalEvent | null {
  const events = initEvents();
  return events.find((e) => e.id === eventId) || null;
}

export function getEventsByCreator(userId: string): LocalEvent[] {
  const events = initEvents();
  return events.filter((e) => e.created_by === userId);
}

export function createEvent(event: Omit<LocalEvent, "id" | "created_at" | "updated_at">): LocalEvent {
  const events = initEvents();
  const now = new Date().toISOString();
  const newEvent: LocalEvent = { ...event, id: crypto.randomUUID(), created_at: now, updated_at: now };
  events.push(newEvent);
  setItem(KEYS.events, events);
  return newEvent;
}

export function decrementSeats(eventId: string): number | null {
  const events = initEvents();
  const idx = events.findIndex((e) => e.id === eventId);
  if (idx === -1 || events[idx].seats_remaining <= 0) return null;
  events[idx].seats_remaining -= 1;
  events[idx].updated_at = new Date().toISOString();
  setItem(KEYS.events, events);
  return events[idx].seats_remaining;
}

// --- Registrations ---
export function getRegistrations(userId: string): LocalRegistration[] {
  const regs = getItem<LocalRegistration[]>(KEYS.registrations, []);
  return regs.filter((r) => r.user_id === userId).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getRegistrationsByEvent(eventId: string): LocalRegistration[] {
  const regs = getItem<LocalRegistration[]>(KEYS.registrations, []);
  return regs.filter((r) => r.event_id === eventId);
}

export function getRegistrationCountByEvent(eventId: string): number {
  return getRegistrationsByEvent(eventId).length;
}

export function createRegistration(reg: Omit<LocalRegistration, "id" | "created_at">): LocalRegistration {
  const regs = getItem<LocalRegistration[]>(KEYS.registrations, []);
  const newReg: LocalRegistration = { ...reg, id: crypto.randomUUID(), created_at: new Date().toISOString() };
  regs.push(newReg);
  setItem(KEYS.registrations, regs);
  return newReg;
}

// --- Scans ---
export function getScans(eventId: string, ticketId: string): LocalScan[] {
  const scans = getItem<LocalScan[]>(KEYS.scans, []);
  return scans.filter((s) => s.event_id === eventId && s.ticket_id === ticketId);
}

export function createScan(scan: Omit<LocalScan, "id" | "scanned_at">): LocalScan {
  const scans = getItem<LocalScan[]>(KEYS.scans, []);
  const newScan: LocalScan = { ...scan, id: crypto.randomUUID(), scanned_at: new Date().toISOString() };
  scans.push(newScan);
  setItem(KEYS.scans, scans);
  return newScan;
}

// --- Utility: get registration with profile join for scanner ---
export function getRegistrationWithProfile(ticketId: string, eventId: string): (LocalRegistration & { profileName: string }) | null {
  const regs = getItem<LocalRegistration[]>(KEYS.registrations, []);
  const reg = regs.find((r) => r.ticket_id === ticketId && r.event_id === eventId);
  if (!reg) return null;
  const profile = getProfile(reg.user_id);
  return { ...reg, profileName: profile?.name || "Attendee" };
}
