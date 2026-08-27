"use client";

import * as Sentry from "@sentry/nextjs";

/**
 * Admin panel network layer.
 *
 * Every admin page used to call `fetch()` bare, with a `.finally(() => setLoading(false))`
 * to clear its skeleton. `finally` runs when a promise settles — it does nothing at all
 * when a promise never settles, which is exactly what happens when a phone hands off
 * between wifi and cellular: the socket stays open, the server is gone, and `fetch`
 * waits indefinitely. The result was an admin panel stuck on skeletons with no error
 * and no retry (observed on mobile, 27 Aug 2026).
 *
 * The rest of the app already guards against this — see the AbortController +
 * withTimeout + safety-net stack in `src/app/social/feed/page.tsx`. This module is the
 * admin equivalent, in one place so no call site has to remember it.
 *
 * Two entry points:
 *   adminRequest() — returns the raw Response. For mutations that inspect status codes.
 *   adminFetch()   — returns parsed JSON, throws AdminFetchError. For loaders.
 */

/** Loaders get longer than a mutation: /api/admin/overview fans out to ~15 DB round-trips. */
const DEFAULT_TIMEOUT_MS = 15_000;

export class AdminFetchError extends Error {
  /** HTTP status, or 0 when the request never got a response (timeout / offline). */
  readonly status: number;
  /** True when our own deadline fired rather than the server answering. */
  readonly timedOut: boolean;

  constructor(message: string, status: number, timedOut = false) {
    super(message);
    this.name = "AdminFetchError";
    this.status = status;
    this.timedOut = timedOut;
  }
}

/**
 * True when the caller's own AbortSignal cancelled the request — a superseded
 * search keystroke, or a component unmounting. Not a failure: callers should
 * return quietly rather than flashing an error or clearing their loading flag
 * (a newer request is already in flight and owns that state).
 */
export function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

/** Human-readable fallback when the route handler didn't send an `error` field. */
function messageForStatus(status: number): string {
  if (status === 401) return "Your session expired. Sign in again.";
  if (status === 403) return "You don't have access to this.";
  if (status === 404) return "Not found.";
  if (status === 429) return "Too many requests. Wait a moment and retry.";
  if (status >= 500) return "Server error. Try again.";
  return `Request failed (${status}).`;
}

/**
 * Report the failures that mean something is actually broken. Deliberately
 * excludes 4xx: an expired session or a permission denial is an expected
 * outcome, not an incident, and reporting them would bury the real signal.
 */
function report(url: string, method: string, err: AdminFetchError): void {
  if (err.status !== 0 && err.status < 500) return;
  // Telemetry must never be able to break the error path. If Sentry throws (not
  // initialised, blocked by an extension, bundled differently), the caller still
  // needs the real AdminFetchError — swallowing a failed report costs us one
  // event, whereas letting it escape would replace "Request timed out" with a
  // meaningless TypeError at the call site.
  try {
    Sentry.captureException(err, {
      level: err.status >= 500 ? "error" : "warning",
      tags: {
        area: "admin",
        admin_endpoint: url.split("?")[0],
        admin_method: method,
        admin_timeout: String(err.timedOut),
      },
    });
  } catch {
    // Nothing useful to do here.
  }
}

export interface AdminRequestInit extends RequestInit {
  /** Hard deadline in ms. Defaults to 15s. */
  timeoutMs?: number;
}

/**
 * `fetch` with a hard deadline attached.
 *
 * Returns the Response untouched so existing `if (!res.ok)` mutation code keeps
 * working. Throws AdminFetchError only when there is no response at all (deadline
 * elapsed, or the network failed).
 *
 * Any `signal` the caller passes is honoured alongside our deadline: whichever
 * fires first aborts the request, and a caller-driven abort is re-thrown as a
 * plain AbortError so `isAbortError()` can tell the two apart.
 */
export async function adminRequest(url: string, init: AdminRequestInit = {}): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, signal: callerSignal, ...rest } = init;
  const method = rest.method ?? "GET";

  // One controller fed by two sources (our timer, the caller's signal) so the
  // socket is actually released rather than left hanging in the background.
  const controller = new AbortController();
  let timedOut = false;

  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
      reject(
        new AdminFetchError(
          `Request timed out after ${Math.round(timeoutMs / 1000)}s. Check your connection.`,
          0,
          true,
        ),
      );
    }, timeoutMs);
  });

  // Same reasoning as the deadline: settle on the caller's abort ourselves
  // rather than waiting for fetch to notice, so a superseded request resolves
  // now instead of sitting until the deadline and reporting a false timeout.
  const racers: Promise<never>[] = [deadline];
  let forwardAbort: (() => void) | undefined;

  if (callerSignal) {
    racers.push(
      new Promise<never>((_, reject) => {
        forwardAbort = () => {
          controller.abort();
          reject(new DOMException("Aborted", "AbortError"));
        };
        if (callerSignal.aborted) forwardAbort();
        else callerSignal.addEventListener("abort", forwardAbort, { once: true });
      }),
    );
  }

  try {
    // Raced, not just aborted. Aborting the controller is what releases the
    // socket, but it only rejects the fetch if fetch honours the signal —
    // this whole module exists because a request that never settles is the
    // failure mode we cannot recover from, so the deadline rejects on its own
    // and never depends on someone else keeping their promise.
    return await Promise.race([fetch(url, { ...rest, signal: controller.signal }), ...racers]);
  } catch (err) {
    // Caller cancelled us on purpose. Pass it through untouched — not a failure,
    // and deliberately not reported: a superseded keystroke is not an incident.
    if (isAbortError(err) || (callerSignal?.aborted && !timedOut)) throw err;

    const failure =
      err instanceof AdminFetchError
        ? err
        : new AdminFetchError("Network error. Check your connection.", 0);

    report(url, method, failure);
    throw failure;
  } finally {
    clearTimeout(timer);
    if (forwardAbort) callerSignal?.removeEventListener("abort", forwardAbort);
  }
}

/**
 * `adminRequest` plus status checking and JSON parsing — the shape loaders want.
 *
 * Throws AdminFetchError on any non-2xx, preferring the route handler's own
 * `{ error }` message over the generic fallback.
 */
export async function adminFetch<T>(url: string, init: AdminRequestInit = {}): Promise<T> {
  const res = await adminRequest(url, init);

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    const failure = new AdminFetchError(body?.error ?? messageForStatus(res.status), res.status);
    report(url, init.method ?? "GET", failure);
    throw failure;
  }

  // 204 No Content is a valid success with nothing to parse.
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/**
 * Turns anything thrown by a loader into text safe to show an admin.
 * Keeps AdminFetchError's specific wording; never leaks a raw stack.
 */
export function errorMessage(err: unknown, fallback = "Something went wrong. Try again."): string {
  if (err instanceof AdminFetchError) return err.message;
  return fallback;
}
