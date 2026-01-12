"use client";

import { createContext, useEffect, useState } from "react";
import type { AuthContextType, User } from "@/lib/auth/types";
import {
  mockLogin,
  mockSignup,
  mockLogout,
  getMockUserFromStorage,
  saveMockUserToStorage,
} from "@/lib/auth/mockAuth";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, check localStorage for existing user
  useEffect(() => {
    const storedUser = getMockUserFromStorage();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await mockLogin(email, password);
      setUser(user);
      saveMockUserToStorage(user);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
    setIsLoading(false);
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await mockSignup(name, email, password);
      setUser(user);
      saveMockUserToStorage(user);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
    setIsLoading(false);
  };

  const logout = () => {
    mockLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
