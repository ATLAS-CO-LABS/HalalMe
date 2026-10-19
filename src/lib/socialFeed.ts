/**
 * Keyset cursor + list helpers for the Social feed (get_social_feed RPC,
 * supabase/migrations/075_social_posts_v2.sql).
 *
 * Offsets were the old approach, and they break as soon as a realtime post is
 * prepended: page 2's "rows 20-39" shifts by one, so a post repeats or a post is
 * skipped. A keyset cursor says "everything after this exact row", which a new
 * post at the top cannot move.
 *
 * Pure module (no React, no path aliases) so it can be unit tested with node.
 */

export type FeedMode = "for_you" | "latest" | "following" | "saved" | "user";

export interface FeedCursor {
  mode: FeedMode;
  id: string;
  /** Chronological modes sort on this (created_at, or bookmark time for saved). */
  ts: string | null;
  /** for_you sorts on this. */
  score: number | null;
  /** for_you only: the moment ages are measured from, pinned for every page. */
  asOf: string | null;
}

export interface FeedSortKeys {
  id: string;
  sort_ts: string | null;
  sort_score: number | null;
}

/**
 * Clock-skew allowance for the pinned for_you time. If the browser clock runs
 * slow, an as-of in the past would hide the newest posts until refresh; a small
 * margin into the future only shifts every age by the same constant.
 */
const AS_OF_SKEW_MS = 2 * 60 * 1000;

export function newAsOf(mode: FeedMode, now: number = Date.now()): string | null {
  return mode === "for_you" ? new Date(now + AS_OF_SKEW_MS).toISOString() : null;
}

export function cursorFromLastRow(mode: FeedMode, row: FeedSortKeys, asOf: string | null): FeedCursor {
  return {
    mode,
    id: row.id,
    ts: mode === "for_you" ? null : row.sort_ts,
    score: mode === "for_you" ? row.sort_score : null,
    asOf: mode === "for_you" ? asOf : null,
  };
}

export function cursorToRpcArgs(cursor: FeedCursor | null | undefined) {
  return {
    p_cursor_ts: cursor?.ts ?? null,
    p_cursor_score: cursor?.score ?? null,
    p_cursor_id: cursor?.id ?? null,
  };
}

/**
 * Appends `incoming` to `existing`, dropping anything already shown. For the
 * ranked feed a post's score can change between page loads (someone liked it),
 * which can carry it across the cursor once; this is the backstop for that.
 */
export function mergeUniqueById<T extends { id: string }>(existing: T[], incoming: T[]): T[] {
  if (incoming.length === 0) return existing;
  const seen = new Set(existing.map((p) => p.id));
  const fresh = incoming.filter((p) => !seen.has(p.id) && (seen.add(p.id), true));
  return fresh.length ? [...existing, ...fresh] : existing;
}

/** Prepends `incoming` (newest first), skipping ids already present. */
export function prependUniqueById<T extends { id: string }>(existing: T[], incoming: T[]): T[] {
  const seen = new Set(existing.map((p) => p.id));
  const fresh = incoming.filter((p) => !seen.has(p.id) && (seen.add(p.id), true));
  return fresh.length ? [...fresh, ...existing] : existing;
}

/**
 * Makes a free-text search term safe to drop into a PostgREST `.or()` /
 * `.ilike()` filter. Commas, parentheses and quotes are filter syntax there, and
 * % / _ / \ are LIKE wildcards; none of them matter for a people/post search.
 */
export function sanitizeSearchTerm(input: string, maxLength = 80): string {
  return input
    .replace(/[%_\\,()"'*:]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}
