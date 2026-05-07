"use client";

/**
 * AppResumeContext
 *
 * Broadcasts a `resumeKey` integer that increments every time the app
 * reconnects after stale inactivity.  Any component that needs to refetch
 * data on resume adds `resumeKey` to its dependency array.
 *
 * Architecture:
 *   AppResumeProvider (in LayoutContent)
 *     └─ calls initAppLifecycle once for the whole app
 *     └─ on reconnect → bumps resumeKey
 *        └─ feed page, notifications, profile… re-run their fetch effects
 *
 * This keeps lifecycle wiring in one place while letting any subtree react
 * to a resume without prop-drilling or repeated event listeners.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { initAppLifecycle } from "@/lib/appLifecycle";

// ─── Context ─────────────────────────────────────────────────────────────────

interface AppResumeContextValue {
  /**
   * Increments each time the app reconnects after stale inactivity.
   * Use as a useEffect dependency to trigger refetches on resume.
   *
   * ```ts
   * const resumeKey = useResumeKey();
   * useEffect(() => {
   *   if (resumeKey === 0) return; // skip initial mount
   *   refetchData();
   * }, [resumeKey]);
   * ```
   */
  resumeKey: number;
}

const AppResumeContext = createContext<AppResumeContextValue>({ resumeKey: 0 });

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppResumeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [resumeKey, setResumeKey] = useState(0);

  // Stable callback ref - avoids re-registering listeners if the component
  // ever re-renders before the effect cleanup runs.
  const bumpRef = useRef<() => void>(() => setResumeKey((k) => k + 1));

  const onReconnect = useCallback(() => {
    bumpRef.current();
  }, []);

  const onReconnectRef = useRef(onReconnect);
  // eslint-disable-next-line react-hooks/refs
  onReconnectRef.current = onReconnect;

  useEffect(() => {
    const cleanupLifecycle = initAppLifecycle({
      onReconnect: () => onReconnectRef.current(),
    });

    return () => {
      cleanupLifecycle();
    };
  }, []);

  return (
    <AppResumeContext.Provider value={{ resumeKey }}>
      {children}
    </AppResumeContext.Provider>
  );
}

// ─── Consumer hook ────────────────────────────────────────────────────────────

/**
 * Returns a number that increments on each stale-resume reconnect.
 * Add to a useEffect dependency array to refetch data when the app returns.
 */
export function useResumeKey(): number {
  return useContext(AppResumeContext).resumeKey;
}
