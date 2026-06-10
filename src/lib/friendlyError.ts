import { TimeoutError } from "./withTimeout";

/**
 * Converts a thrown error into a clear, user-facing message.
 *
 * - Maps known technical failures (timeout, network, permission) to friendly text.
 * - Preserves our own validation messages (file size/type) which are already clear.
 * - Never leaks raw system strings like "Load failed", "Failed to fetch", or
 *   "TypeError" to the user — those fall back to a generic message.
 */
export function friendlyError(
  err: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  const raw = err instanceof Error ? err.message : typeof err === "string" ? err : "";
  const m = raw.toLowerCase();

  // Slow connection / large upload
  if (err instanceof TimeoutError || m.includes("timed out") || m.includes("timeout")) {
    return "That took too long — your connection may be slow. Try again, or use a smaller file.";
  }

  // Network / fetch failures (Safari: "Load failed", Chrome: "Failed to fetch")
  if (
    m.includes("load failed") || m.includes("failed to fetch") ||
    m.includes("networkerror") || m.includes("network request") ||
    m.includes("network connection") || m === "fetch"
  ) {
    return "Couldn't connect — please check your internet and try again.";
  }

  // Permission / auth
  if (
    m.includes("permission") || m.includes("unauthor") ||
    m.includes("row-level") || m.includes("jwt") || m.includes("not authenticated")
  ) {
    return "You don't have permission to do that. Try signing in again.";
  }

  // Our own user-facing validation messages are already clear — show them as-is.
  if (/file (size|type)|not allowed|mb limit|too large|please/i.test(raw)) {
    return raw;
  }

  return fallback;
}
