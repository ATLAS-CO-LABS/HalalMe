"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/auth/AuthModal";
import { authGateAnalytics } from "@/lib/analytics/authGate";

// ── SessionStorage intent ─────────────────────────────────────────
//
// When the modal opens we persist the action's human-readable message so the
// intent survives same-session navigations. We cannot serialise the closure
// itself, so replaying the action across navigations is not attempted - only
// the intent label is kept for analytics / context.
//
// Scenario covered: user hits the gate → dismisses the modal → navigates to
// the full /login page → logs in → is redirected back. On that return visit
// we detect the stored intent and fire authGateAnalytics.converted so the
// cross-navigation funnel step is still counted.

const INTENT_KEY = "hm:gate_intent";

function writeIntent(message: string | undefined): void {
  if (!message || typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(INTENT_KEY, JSON.stringify({ message, ts: Date.now() }));
  } catch {
    // Quota exceeded or SSR - non-fatal.
  }
}

function clearIntent(): void {
  if (typeof sessionStorage === "undefined") return;
  try { sessionStorage.removeItem(INTENT_KEY); } catch { /* ignore */ }
}

function readIntent(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(INTENT_KEY);
    if (!raw) return null;
    return (JSON.parse(raw) as { message: string }).message ?? null;
  } catch {
    return null;
  }
}

// ── Context shape ─────────────────────────────────────────────────
interface AuthGateContextType {
  requireAuth: (action: () => void, message?: string) => void;
}

const AuthGateContext = createContext<AuthGateContextType | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────
export function AuthGateProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [isOpen, setIsOpen]               = useState(false);
  const [message, setMessage]             = useState<string | undefined>();
  const [replayPending, setReplayPending] = useState(false);

  const pendingRef       = useRef<(() => void) | null>(null);
  // Prevents double execution if the replay effect fires more than once while
  // an action is in-flight (e.g. React StrictMode double-invoke in dev, or a
  // rapid second login event arriving before the first action settles).
  const replayLockRef    = useRef(false);
  // Mirrors `message` as a ref so the replay effect can read the label without
  // adding `message` to its dependency array (which would risk spurious runs).
  const messageRef       = useRef(message);
  messageRef.current = message;
  // Guards the one-time cross-navigation intent check so it only runs the
  // first time `user` becomes non-null within this provider instance.
  const intentCheckedRef = useRef(false);

  // ── Cross-navigation conversion check (runs once when user is first set) ──
  useEffect(() => {
    if (intentCheckedRef.current || !user) return;
    intentCheckedRef.current = true;

    // If a prior gate triggered sessionStorage intent AND the user is now
    // logged in (they used the full /login page instead of the inline modal),
    // record the conversion and clear the stored intent.
    const stored = readIntent();
    if (!stored) return;
    clearIntent();
    authGateAnalytics.converted(stored);
  }, [user]);

  // ── Replay pending action after auth state confirms user is set ──
  //
  // Fires after the React commit phase, guaranteeing every component that
  // consumes useAuth() has already re-rendered with the new user value.
  // Action handlers that use the `userRef` pattern (see recipe/upload pages)
  // will therefore read fresh user state - no setTimeout race.
  useEffect(() => {
    if (!replayPending || !user) return;

    const action = pendingRef.current;
    if (!action) return;

    // Replay lock - prevents re-entrant execution in the same in-flight window.
    if (replayLockRef.current) return;
    replayLockRef.current = true;

    // Atomically consume the pending action before calling it so that any
    // synchronous re-entry (unlikely but possible) cannot queue a second run.
    pendingRef.current = null;
    setReplayPending(false);
    clearIntent();

    try {
      authGateAnalytics.converted(messageRef.current);
      action();
    } finally {
      replayLockRef.current = false;
    }
    // Intentionally omitting `message` from deps - messageRef.current is used
    // instead to avoid spurious re-runs if message changes for other reasons.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replayPending, user]);

  // ── requireAuth ───────────────────────────────────────────────────
  const requireAuth = useCallback(
    (action: () => void, msg?: string) => {
      // Already authenticated - execute immediately, no modal needed.
      if (user) {
        action();
        return;
      }

      // Deduplication: a pending action already exists (modal is open).
      // Ignore until the current one resolves or is dismissed.
      if (pendingRef.current !== null) return;

      pendingRef.current = action;
      setMessage(msg);
      setIsOpen(true);
      writeIntent(msg);
      authGateAnalytics.triggered(msg);
    },
    [user],
  );

  // ── Modal callbacks ────────────────────────────────────────────────
  const handleSuccess = useCallback(() => {
    setIsOpen(false);
    // clearIntent() is deferred to the replay effect so the label is still
    // available for the analytics.converted() call there.
    setReplayPending(true);
  }, []);

  const handleClose = useCallback(() => {
    // Capture before clearing so the analytics event has the right label.
    const hadPending = pendingRef.current !== null;
    setIsOpen(false);
    pendingRef.current = null;
    setReplayPending(false);
    replayLockRef.current = false; // reset in case close races a replay
    clearIntent();
    if (hadPending) authGateAnalytics.dismissed(messageRef.current);
  }, []);

  return (
    <AuthGateContext.Provider value={{ requireAuth }}>
      {children}
      <AuthModal
        isOpen={isOpen}
        message={message}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </AuthGateContext.Provider>
  );
}

// ── Consumer hook ──────────────────────────────────────────────────
export function useAuthGateContext() {
  const ctx = useContext(AuthGateContext);
  if (!ctx) throw new Error("useAuthGateContext must be used within AuthGateProvider");
  return ctx;
}
