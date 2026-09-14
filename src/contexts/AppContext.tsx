import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  cancelRegistration: (registrationId: string) => Promise<void>;
  toggleBookmark: (eventId: string) => void;
  isRegistered: (eventId: string) => boolean;
  isBookmarked: (eventId: string) => boolean;
  activeTab: number;
  setActiveTab: (tab: number) => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshRegistrations: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, role: "student" | "organisation", name: string) => Promise<{ error?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<LocalProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [registrations, setRegistrations] = useState<LocalRegistration[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  const loadUser = useCallback(async (uid: string) => {
    const [nextProfile, nextRegistrations] = await Promise.all([
      db.getProfile(uid),
      db.getRegistrations(uid),
    ]);
    setProfile(nextProfile);
    setRegistrations(nextRegistrations);
    setUserId(uid);
  }, []);

  useEffect(() => {
    let mounted = true;
    void supabase.auth.getSession().then(async ({ data, error }) => {
      if (error) {
        if (mounted) setIsLoading(false);
        return;
      }
      if (mounted && data.session) {
        try {
          await loadUser(data.session.user.id);
        } finally {
          if (mounted) setIsLoading(false);
        }
      } else if (mounted) {
        setIsLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        void loadUser(session.user.id).finally(() => mounted && setIsLoading(false));
      } else {
        setUserId(null);
        setProfile(null);
        setRegistrations([]);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [loadUser]);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (data.user) await loadUser(data.user.id);
    return {};
  }, [loadUser]);

  const signup = useCallback(async (email: string, password: string, role: "student" | "organisation", name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role, name } },
    });
    if (error) return { error: error.message };
    if (data.user && data.session) await loadUser(data.user.id);
    return {};
  }, [loadUser]);

  const refreshProfile = useCallback(async () => {
    if (userId) setProfile(await db.getProfile(userId));
  }, [userId]);

  const refreshRegistrations = useCallback(async () => {
    if (userId) setRegistrations(await db.getRegistrations(userId));
  }, [userId]);

  const registerForEvent = useCallback(async (eventId: string) => {
    if (!userId) return null;
    const registration = await db.registerForEvent(eventId);
    setRegistrations((previous) => [registration, ...previous.filter((item) => item.id !== registration.id)]);
    return registration;
  }, [userId]);

  const cancelRegistration = useCallback(async (registrationId: string) => {
    await db.cancelRegistration(registrationId);
    await refreshRegistrations();
  }, [refreshRegistrations]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setActiveTab(0);
  }, []);

  const isRegistered = useCallback(
    (eventId: string) => registrations.some((registration) => registration.event_id === eventId && registration.status === "Confirmed"),
    [registrations],
  );

  const isBookmarked = useCallback((eventId: string) => bookmarks.includes(eventId), [bookmarks]);

  return (
    <AppContext.Provider value={{
      userId,
      profile,
      isLoggedIn: !!userId,
      isLoading,
      registrations,
      bookmarks,
      registerForEvent,
      cancelRegistration,
      toggleBookmark: (eventId) => setBookmarks((current) => current.includes(eventId)
        ? current.filter((id) => id !== eventId)
        : [...current, eventId]),
      isRegistered,
      isBookmarked,
      activeTab,
      setActiveTab,
      logout,
      refreshProfile,
      refreshRegistrations,
      login,
      signup,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
