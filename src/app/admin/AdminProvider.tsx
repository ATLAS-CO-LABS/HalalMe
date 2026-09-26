"use client";

import { createContext, useCallback, useContext } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch, errorMessage } from "./_fetch";
import { adminKeys } from "./_query";

// Single source of truth for the current admin's identity, permissions, badge
// counts and the staff/team roster. Previously each page re-fetched
// /api/admin/me and /api/admin/team on mount (the layout + merchants list +
// merchant detail + chat thread all did it independently).
//
// This is now a thin read over two cached queries rather than a store. It used
// to hold all four values in React state and drive them with a hand-rolled
// 30s setInterval plus a visibilitychange listener, which meant server data was
// living in global client state and every consumer had to trust this component
// to keep it fresh. The cache does that now; the exported shape is unchanged so
// no consumer needed touching.

export type Access = "none" | "view" | "manage";
export type AdminModule = "merchants" | "users" | "kitchen" | "hub" | "rewards" | "analytics" | "support";
export type Permissions = Record<AdminModule, Access>;
export interface TeamMember { id: string; full_name: string; email: string | null; role?: string }

interface AdminContextValue {
  role: string | null;
  permissions: Permissions | null;
  counts: Record<string, number>;
  team: TeamMember[];
  isSuper: boolean;
  /** True once identity has loaded successfully at least once. */
  loaded: boolean;
  /** Set when the last identity load failed. Null while healthy. */
  error: string | null;
  /** view-or-better by default; pass "manage" to require manage. */
  can: (module: AdminModule, level?: Access) => boolean;
  refresh: () => void;
}

interface MePayload {
  role?: string;
  permissions?: Permissions;
  counts?: Record<string, number>;
}

// Stable references: returning a fresh {} / [] on every render would change
// identity each time and defeat memoisation in consumers.
const EMPTY_COUNTS: Record<string, number> = {};
const EMPTY_TEAM: TeamMember[] = [];

const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside <AdminProvider>");
  return ctx;
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  // Identity + badge counts. `refetchInterval` replaces the old setInterval, and
  // TanStack pauses it while the tab is hidden (refetchIntervalInBackground is
  // false by default) so the manual `document.hidden` guard is gone too. The
  // global `refetchOnWindowFocus` replaces the visibilitychange listener.
  const meQuery = useQuery({
    queryKey: adminKeys.module("me"),
    queryFn: () => adminFetch<MePayload>("/api/admin/me"),
    refetchInterval: 30_000,
  });

  // Staff roster. Changes rarely and only feeds assignee dropdowns, so it gets a
  // long staleTime and its failure is non-blocking.
  const teamQuery = useQuery({
    queryKey: adminKeys.module("team"),
    queryFn: () => adminFetch<{ team?: TeamMember[] }>("/api/admin/team"),
    staleTime: 5 * 60_000,
  });

  const role = meQuery.data?.role ?? null;
  const permissions = meQuery.data?.permissions ?? null;
  const counts = meQuery.data?.counts ?? EMPTY_COUNTS;
  const team = teamQuery.data?.team ?? EMPTY_TEAM;
  const isSuper = role === "super_admin";

  // Invalidate rather than calling refetch() on the query objects: those change
  // identity every render, which would make `refresh` unstable and re-fire any
  // consumer effect that depends on it. `queryClient` is stable.
  const queryClient = useQueryClient();
  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: adminKeys.module("me") });
    void queryClient.invalidateQueries({ queryKey: adminKeys.module("team") });
  }, [queryClient]);

  const can = useCallback(
    (module: AdminModule, level: Access = "view") => {
      if (isSuper) return true;
      const access = permissions?.[module] ?? "none";
      return level === "view" ? access !== "none" : access === "manage";
    },
    [permissions, isSuper],
  );

  const value: AdminContextValue = {
    role,
    permissions,
    counts,
    team,
    isSuper,
    loaded: meQuery.isSuccess,
    error: meQuery.isError ? errorMessage(meQuery.error, "Couldn't load your admin profile.") : null,
    can,
    refresh,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}
