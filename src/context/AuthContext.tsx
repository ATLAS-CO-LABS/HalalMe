"use client";

import { createContext, useEffect, useState, useCallback } from "react";
import { authService } from "@/services/authService";
import { minDelay } from "@/lib/minDelay";
import type { Profile } from "@/types";

interface AuthContextType {
  user: Profile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<{ requiresVerification: boolean }>;
  logout: () => Promise<void>;
  /** Re-fetches the profile from Supabase and updates context state. */
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // onAuthStateChange is intentionally not used: its async callback dead-locks
    // the Supabase client after a tab switch when the user is logged in, causing
    // all subsequent API calls to hang silently. Initial auth state is handled
    // here via refreshUser(); login/logout/OTP flows call refreshUser() manually.
    minDelay(authService.refreshUser(), 400)
      .then((profile) => { if (active) setUser(profile); })
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setIsLoading(false); });

    return () => { active = false; };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await minDelay(authService.login(email, password));
      const profile = await authService.refreshUser();
      setUser(profile);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const data = await authService.signup(name, email, password);
    const requiresVerification = !data.session;
    if (!requiresVerification) {
      const profile = await authService.refreshUser();
      setUser(profile);
    }
    return { requiresVerification };
  }, []);

  const refreshUser = useCallback(async () => {
    const profile = await authService.refreshUser();
    setUser(profile);
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setIsLoading(false);
    // Clear per-user chat data so the next user starts fresh
    try { sessionStorage.removeItem("kitchen-ai-chat"); } catch {}
    await authService.logout();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
