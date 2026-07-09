"use client";

/**
 * RewardsRealtimeContext
 *
 * Listens for new reward_transactions rows for the signed-in user in
 * real time, from ANY earn path (API route, DB trigger, background ping —
 * daily-checkin, donations, Hub/Kitchen actions, redemptions). Two jobs:
 *
 *   1. Pops a "+X · reason" toast the instant points land — the missing
 *      earning feedback flagged during Day 3 testing.
 *   2. Exposes `refreshKey`, which increments on every event. Any
 *      balance-displaying component adds it to a useEffect dependency to
 *      refetch instead of racing a fire-and-forget award (the Day 3 bug:
 *      daily-login's +10 only appeared after a manual page refresh).
 *
 * Same channel/cleanup pattern as hubService.subscribeToNotifications, and
 * re-subscribes on `resumeKey` so it survives the Realtime force-disconnect
 * AppResumeContext does after the tab has been hidden for >5s.
 */

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useResumeKey } from "@/context/AppResumeContext";
import { supabase } from "@/services/supabase";

interface RewardToast {
  id: string;
  points: number;
  description: string | null;
}

interface RewardsRealtimeContextValue {
  /** Increments on every new reward_transactions row for this user. */
  refreshKey: number;
}

const RewardsRealtimeContext = createContext<RewardsRealtimeContextValue>({ refreshKey: 0 });

export function useRewardsRefreshKey(): number {
  return useContext(RewardsRealtimeContext).refreshKey;
}

export function RewardsRealtimeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const resumeKey = useResumeKey();
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState<RewardToast | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`reward-transactions:${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reward_transactions", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const row = payload.new as { id: string; points: number; description: string | null };
          setRefreshKey((k) => k + 1);

          if (row.points > 0) {
            setToast({ id: row.id, points: row.points, description: row.description });
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
            toastTimerRef.current = setTimeout(() => setToast(null), 4000);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, resumeKey]);

  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

  return (
    <RewardsRealtimeContext.Provider value={{ refreshKey }}>
      {children}
      {toast && (
        <div
          key={toast.id}
          className="fixed bottom-6 right-6 z-[200] flex items-center gap-2 px-4 py-3 shadow-lg border animate-in fade-in slide-in-from-bottom-2"
          style={{ backgroundColor: "#0A1C19", borderColor: "#14B8A6", color: "#F7E7CE" }}
        >
          <span className="text-sm font-extrabold" style={{ color: "#14B8A6" }}>+{toast.points}</span>
          <span className="text-sm">{toast.description ?? "Points earned"}</span>
        </div>
      )}
    </RewardsRealtimeContext.Provider>
  );
}
