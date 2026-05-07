"use client";

import { useEffect, useRef } from "react";
import { initAppLifecycle } from "@/lib/appLifecycle";

/**
 * React wrapper around initAppLifecycle.
 *
 * Registers the three lifecycle listeners (visibilitychange / pageshow /
 * online) for as long as the component is mounted, and calls `onReconnect`
 * after each successful reconnect.
 *
 * The callback is held in a ref so callers can pass an inline function without
 * causing the effect to re-run on every render.
 *
 * Usage — call once globally in your root layout:
 *
 * ```tsx
 * useAppResume(() => {
 *   // refetch anything that could have gone stale
 *   refetchFeed();
 *   refetchNotifications();
 * });
 * ```
 *
 * Or call in a specific page to refetch only that page's data:
 *
 * ```tsx
 * useAppResume(() => loadFeed(activeTab, 1, false));
 * ```
 */
export function useAppResume(onReconnect?: () => void | Promise<void>): void {
  // Stable ref — callback can change on every render without re-registering
  // the event listeners.
  const callbackRef = useRef(onReconnect);
  callbackRef.current = onReconnect;

  useEffect(() => {
    const cleanup = initAppLifecycle({
      onReconnect: () => callbackRef.current?.(),
    });
    return cleanup;
    // Empty deps: listeners are registered once for the component's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
