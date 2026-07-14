"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

// Single source of truth for the current admin's identity, permissions, badge
// counts and the staff/team roster. Previously each page re-fetched
// /api/admin/me and /api/admin/team on mount (the layout + merchants list +
// merchant detail + chat thread all did it independently). This provider fetches
// them once, polls counts on a timer / focus, and exposes a `can()` gate so every
// page derives manage-access the same way.

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
  loaded: boolean;
  /** view-or-better by default; pass "manage" to require manage. */
  can: (module: AdminModule, level?: Access) => boolean;
  refresh: () => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside <AdminProvider>");
  return ctx;
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loaded, setLoaded] = useState(false);

  const loadMe = useCallback(() => {
    if (typeof document !== "undefined" && document.hidden) return;
    fetch("/api/admin/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        if (d.role) setRole(d.role);
        if (d.permissions) setPermissions(d.permissions);
        setCounts(d.counts ?? {});
        setLoaded(true);
      })
      .catch(() => {});
  }, []);

  // Identity + counts: load now, poll every 30s, refresh on tab focus.
  useEffect(() => {
    loadMe();
    const interval = setInterval(loadMe, 30000);
    window.addEventListener("focus", loadMe);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", loadMe);
    };
  }, [loadMe]);

  // Team roster: load once (changes rarely).
  useEffect(() => {
    fetch("/api/admin/team")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.team) setTeam(d.team); })
      .catch(() => {});
  }, []);

  const isSuper = role === "super_admin";

  const can = useCallback(
    (module: AdminModule, level: Access = "view") => {
      if (isSuper) return true;
      const access = permissions?.[module] ?? "none";
      return level === "view" ? access !== "none" : access === "manage";
    },
    [permissions, isSuper],
  );

  return (
    <AdminContext.Provider value={{ role, permissions, counts, team, isSuper, loaded, can, refresh: loadMe }}>
      {children}
    </AdminContext.Provider>
  );
}
