import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as db from "@/lib/localDb";
import type { LocalProfile, LocalRegistration } from "@/lib/localDb";

interface AppContextType {
  userId: string | null;
  profile: LocalProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  registrations: LocalRegistration[];
  bookmarks: string[];
  registerForEvent: (eventId: string) => Promise<LocalRegistration | null>;
  toggleBookmark: (eventId: string) => void;
  isRegistered: (eventId: string) => boolean;
  isBookmarked: (eventId: string) => boolean;
  activeTab: number;
  setActiveTab: (tab: number) => void;
  logout: () => void;
  refreshProfile: () => void;
  refreshRegistrations: () => void;
  login: (email: string, password: string) => { error?: string };
  signup: (email: string, password: string, role: "student" | "organisation", name: string) => { error?: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function generateTicketId() {
  return "TKT-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<LocalProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [registrations, setRegistrations] = useState<LocalRegistration[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  const loadUser = useCallback((uid: string) => {
    const p = db.getProfile(uid);
    setProfile(p);
    setRegistrations(db.getRegistrations(uid));
    setUserId(uid);
  }, []);

  useEffect(() => {
    const session = db.getSession();
    if (session) {
      loadUser(session.userId);
    }
    setIsLoading(false);
  }, [loadUser]);

  const login = useCallback((email: string, password: string) => {
    const result = db.signIn(email, password);
    if ("error" in result) return { error: result.error };
    loadUser(result.profile.id);
    return {};
  }, [loadUser]);

  const signup = useCallback((email: string, password: string, role: "student" | "organisation", name: string) => {
    const result = db.signUp(email, password, role, name);
    if ("error" in result) return { error: result.error };
    loadUser(result.profile.id);
    return {};
  }, [loadUser]);

  const refreshProfile = useCallback(() => {
    if (userId) {
      setProfile(db.getProfile(userId));
    }
  }, [userId]);

  const refreshRegistrations = useCallback(() => {
    if (userId) {
      setRegistrations(db.getRegistrations(userId));
    }
  }, [userId]);

  const registerForEvent = useCallback(async (eventId: string): Promise<LocalRegistration | null> => {
    if (!userId) return null;
    const remaining = db.decrementSeats(eventId);
    if (remaining === null) return null;

    const ticketId = generateTicketId();
    const reg = db.createRegistration({
      user_id: userId,
      event_id: eventId,
      ticket_id: ticketId,
      qr_code: `campusdistrict://ticket/${ticketId}`,
      status: "Confirmed",
    });
    setRegistrations((prev) => [reg, ...prev]);
    return reg;
  }, [userId]);

  const toggleBookmark = useCallback((eventId: string) => {
    setBookmarks((prev) =>
      prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
    );
  }, []);

  const isRegistered = useCallback(
    (eventId: string) => registrations.some((r) => r.event_id === eventId),
    [registrations]
  );

  const isBookmarked = useCallback(
    (eventId: string) => bookmarks.includes(eventId),
    [bookmarks]
  );

  const logout = useCallback(() => {
    db.signOut();
    setUserId(null);
    setProfile(null);
    setRegistrations([]);
    setBookmarks([]);
    setActiveTab(0);
  }, []);

  return (
    <AppContext.Provider
      value={{
        userId,
        profile,
        isLoggedIn: !!userId,
        isLoading,
        registrations,
        bookmarks,
        registerForEvent,
        toggleBookmark,
        isRegistered,
        isBookmarked,
        activeTab,
        setActiveTab,
        logout,
        refreshProfile,
        refreshRegistrations,
        login,
        signup,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
