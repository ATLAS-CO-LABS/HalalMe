/**
 * Auth gate analytics.
 *
 * Tracks three moments in the auth-gate funnel:
 *
 *   triggered  — an unauthenticated user attempted a protected action
 *   converted  — the user signed in and the pending action was replayed
 *   dismissed  — the user closed the auth modal without signing in
 *
 * Currently writes structured logs to the console (dev only).
 * Replace the body of `emit` to wire any real analytics service
 * (e.g. Mixpanel, Amplitude, PostHog, GA4).
 */

type AuthGateEvent = "triggered" | "converted" | "dismissed";

function emit(event: AuthGateEvent, action: string): void {
  if (process.env.NODE_ENV !== "development") return;
  // Swap the line below for your analytics SDK call, e.g.:
  // analytics.track(`auth_gate_${event}`, { action_label: action });
  console.log(
    `%c[AuthGate:${event}]`,
    event === "converted"
      ? "color:#4ade80;font-weight:bold"
      : event === "dismissed"
      ? "color:#f87171;font-weight:bold"
      : "color:#a855f7;font-weight:bold",
    { action, ts: new Date().toISOString() },
  );
}

export const authGateAnalytics = {
  /** User hit the auth gate — which action triggered it */
  triggered: (message?: string) => emit("triggered", message ?? "(unlabelled)"),
  /** User signed in and the pending action was successfully replayed */
  converted: (message?: string) => emit("converted", message ?? "(unlabelled)"),
  /** User dismissed the modal without signing in */
  dismissed: (message?: string) => emit("dismissed", message ?? "(unlabelled)"),
};
