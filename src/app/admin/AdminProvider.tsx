"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { adminFetch, errorMessage, isAbortError } from "./_fetch";

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
  const [error, setError] = useState<string | null>(null);

  /**
   * `background: true` marks the 30s poll and the on-resume refresh — those skip
   * while the tab is hidden, because polling a backgrounded tab is waste.
   *
   * The first load must NOT skip. It previously bailed out whenever
   * `document.hidden` was true, which on mobile is common at mount time (a tab
   * restored in the background, a link opened into a background tab). The panel
   * then had no identity and nothing reliable to retry it — `window.focus` does
   * not fire dependably on mobile tab restore, and background `setInterval` is
   * throttled or frozen. `visibilitychange` below is the signal that does fire.
   */
  const loadMe = useCallback((background = false) => {
    if (background && typeof document !== "undefined" && document.hidden) return;
    adminFetch<MePayload>("/api/admin/me")
      .then((d) => {
        if (d.role) setRole(d.role);
        if (d.permissions) setPermissions(d.permissions);
        setCounts(d.counts ?? {});
        setLoaded(true);
        setError(null);
      })
      .catch((err) => {
        if (isAbortError(err)) return;
        setError(errorMessage(err, "Couldn't load your admin profile."));
      });
  }, []);

  const loadTeam = useCallback(() => {
    adminFetch<{ team?: TeamMember[] }>("/api/admin/team")
      .then((d) => { if (d.team) setTeam(d.team); })
      .catch(() => {
        // Non-blocking: the roster only feeds assignee dropdowns. adminFetch has
        // already reported it if it was a real failure.
      });
  }, []);

  const refresh = useCallback(() => {
    loadMe();
    loadTeam();
  }, [loadMe, loadTeam]);

  // Identity + counts: load now, poll every 30s, refresh when the tab comes back.
  useEffect(() => {
    loadMe();
    const interval = setInterval(() => loadMe(true), 30000);
    const onVisible = () => { if (!document.hidden) loadMe(true); };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [loadMe]);

  // Team roster: load once (changes rarely).
  useEffect(() => { loadTeam(); }, [loadTeam]);

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
    <AdminContext.Provider value={{ role, permissions, counts, team, isSuper, loaded, error, can, refresh }}>
      {children}
    </AdminContext.Provider>
  );
}
