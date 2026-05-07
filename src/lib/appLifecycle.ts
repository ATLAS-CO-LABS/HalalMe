/**
 * appLifecycle.ts
 *
 * Framework-agnostic browser-lifecycle helpers for Supabase apps.
 *
 * Three events trigger a reconnect:
 *   1. visibilitychange → "visible"   (tab switch, minimise/restore)
 *   2. pageshow persisted:true         (BFCache restore — JS was frozen)
 *   3. online                          (network returned)
 *
 * Root cause this addresses:
 *   After BFCache / page freeze or a long background period, Phoenix Socket
 *   (Supabase Realtime) thinks it is still connected because its heartbeat
 *   timer was suspended and never detected the drop.  Explicit disconnect →
 *   connect forces Phoenix to re-establish the WebSocket so components can
 *   re-subscribe via resumeKey and receive live events again.
 *
 *   JWT refresh is intentionally left to autoRefreshToken: true — calling
 *   refreshSession() manually races with that timer and can sign the user out.
 */

import { supabase } from "@/services/supabase";

// ─── Inactivity tracking ──────────────────────────────────────────────────────

/**
 * How long the page must have been hidden before we cycle the WebSocket.
 * Browsers (especially Chrome on mobile) can kill connections in seconds.
 * 5 s is aggressive enough to catch real-world tab switches without cycling
 * on accidental < 5 s focus losses.
 */
export const STALE_THRESHOLD_MS = 5_000; // 5 s

/**
 * Minimum ms between reconnect attempts.
 * Guards against visibilitychange + pageshow + online all firing within
 * the same BFCache restore (they can arrive within a few ms of each other).
 */
export const RECONNECT_COOLDOWN_MS = 2_000; // 2 s

let hiddenAt: number | null = null;
let lastReconnectAt = 0;

/** Call when the page becomes hidden so we can measure inactive duration. */
export function markHidden(): void {
  hiddenAt = Date.now();
}

/** Returns how long (ms) the page has been hidden. 0 if never hidden. */
export function hiddenDurationMs(): number {
  return hiddenAt !== null ? Date.now() - hiddenAt : 0;
}

// ─── Supabase reconnect ───────────────────────────────────────────────────────

// Mutex — prevents concurrent/duplicate reconnect attempts.
let reconnecting = false;

/**
 * Force-cycles the Supabase Realtime (Phoenix) WebSocket.
 *
 * We intentionally do NOT call supabase.auth.refreshSession() here.
 * autoRefreshToken: true already manages the JWT lifecycle automatically.
 * Calling refreshSession() manually races with that internal timer: both
 * would use the same single-use refresh token, one request fails, Supabase
 * internally calls signOut(), the SIGNED_OUT auth event fires, and the app
 * briefly loses its user state — causing AuthGuard to unmount pages or
 * navigation to the login screen mid-session.
 *
 * The realtime socket, by contrast, cannot recover on its own after a
 * deliberate disconnect() call: Phoenix only auto-rejoins channels after an
 * *unexpected* close (network drop / BFCache unfreeze).  We must cycle it
 * manually so components that re-subscribe via resumeKey get a live socket.
 *
 * Safe to call from multiple event handlers — guarded by the mutex.
 */
export async function reconnectSupabase(): Promise<void> {
  if (reconnecting) return;
  reconnecting = true;

  try {
    console.log("[Lifecycle] reconnectSupabase called");
    // Tear down all channel state before cycling the socket.
    // disconnect() + connect() alone is not enough — channels that were in
    // "joined" state auto-rejoin only after an *unexpected* socket close, not
    // after a programmatic disconnect.  removeAllChannels() fully removes them
    // so the subscribeToFeed / subscribeToPost effects (triggered by resumeKey)
    // re-create each subscription on a clean socket.
    await supabase.removeAllChannels();
    supabase.realtime.disconnect();
    // Brief pause so Phoenix finishes its internal cleanup before reconnect.
    await new Promise<void>((resolve) => setTimeout(resolve, 150));
    supabase.realtime.connect();
  } catch {
    // Non-critical — realtime events are missed until the next natural
    // reconnect or page reload.
  } finally {
    reconnecting = false;
  }
}

// ─── Lifecycle initialiser ───────────────────────────────────────────────────

export interface AppLifecycleOptions {
  /**
   * Called after reconnectSupabase() completes successfully.
   * Use this to refetch any stale app data (feed, notifications, profile…).
   * May be async — errors are swallowed so they don't break the lifecycle.
   */
  onReconnect?: () => void | Promise<void>;
}

/**
 * Wires up the three browser lifecycle events and returns a cleanup function.
 *
 * Call once at the app root (e.g. in a React useEffect or Next.js layout).
 *
 * ```ts
 * const cleanup = initAppLifecycle({ onReconnect: () => refetchAll() });
 * // …later…
 * cleanup();
 * ```
 */
export function initAppLifecycle(options: AppLifecycleOptions = {}): () => void {
  const { onReconnect } = options;

  /** Runs reconnect then fires the callback — errors never propagate. */
  async function resume(alwaysReconnect = false): Promise<void> {
    // Skip entirely if the page was never hidden and this isn't a forced
    // reconnect (BFCache / network return).
    if (hiddenAt === null && !alwaysReconnect) return;

    const duration = hiddenDurationMs();
    console.log("[Lifecycle] resume", { duration, alwaysReconnect });

    // Cycle the WebSocket if the user was away > STALE_THRESHOLD_MS or this
    // is a forced reconnect (BFCache unfreeze / network return).
    // Browsers break connections in seconds, not minutes — keep the threshold low.
    // Cooldown prevents rapid socket cycling when visibilitychange + pageshow +
    // online all fire together during a BFCache restore.
    let didReconnect = false;
    if (alwaysReconnect || duration > STALE_THRESHOLD_MS) {
      const now = Date.now();
      if (now - lastReconnectAt >= RECONNECT_COOLDOWN_MS) {
        lastReconnectAt = now;
        await reconnectSupabase();
        didReconnect = true;
      }
    }

    // Reset before notifying so a new focus-loss starts a clean measurement.
    hiddenAt = null;

    // Only notify subscribers when we actually cycled the WebSocket.
    // Firing onReconnect on every short tab-switch (< STALE_THRESHOLD_MS) would
    // increment resumeKey unnecessarily, causing feed remounts and double-fetches
    // on routine focus changes (e.g. switching to VS Code for < 5 s).
    if (!didReconnect) return;

    try {
      await onReconnect?.();
    } catch {
      // Callback errors must not break the lifecycle.
    }
  }

  // ── Handler: tab becomes visible / window is restored ────────────────────
  function handleVisibilityChange(): void {
    if (document.visibilityState === "hidden") {
      markHidden();
    } else {
      // Don't await — fire-and-forget from the event handler.
      void resume();
    }
  }

  // ── Handler: BFCache restore (back/forward navigation) ───────────────────
  // persisted:true means the page was frozen, not freshly loaded.
  // The WebSocket is definitely dead — always reconnect regardless of duration.
  function handlePageShow(e: PageTransitionEvent): void {
    if (e.persisted) {
      void resume(/* alwaysReconnect */ true);
    }
  }

  // ── Handler: network returned after going offline ─────────────────────────
  function handleOnline(): void {
    void resume(/* alwaysReconnect */ true);
  }

  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("pageshow", handlePageShow);
  window.addEventListener("online", handleOnline);

  /** Cleanup — call this when the root component unmounts. */
  return function cleanup(): void {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("pageshow", handlePageShow);
    window.removeEventListener("online", handleOnline);
  };
}
