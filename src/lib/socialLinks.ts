/**
 * Turns user-written post/comment text into safe, renderable segments.
 *
 * Why this exists: post text used to be dropped into a <p> as one plain string,
 * so a pasted recipe link was just characters. It had no hover state, no click
 * target, and long URLs were clipped by the card's overflow. This is the single
 * place that decides what in a piece of text becomes a link.
 *
 * Safety rules (a URL that fails any of them stays plain text):
 *   - http(s) only. No javascript:, data:, file: and so on.
 *   - No embedded credentials. "https://halalme.co.uk@evil.example" really
 *     points at evil.example; showing it as a link would be a phishing aid.
 *   - Must parse with the URL constructor and have a dotted host (or localhost).
 *   - Capped length.
 * Internal HalalMe URLs (any subdomain) are resolved to an in-app path, so they
 * navigate client-side and kitchen.halalme.co.uk/recipes/x lands on the same
 * route as halalme.co.uk/kitchen/recipes/x.
 *
 * Pure module: no React, no DOM, no path aliases, so it can be unit tested with
 * plain node (scripts/social-tests).
 */

export type TextSegment =
  | { type: "text"; value: string }
  | { type: "link"; value: string; href: string; internal: boolean; display: string }
  | { type: "mention"; value: string; username: string };

/** Mirrors SUBDOMAIN_MAP in src/middleware.ts. "" = no prefix (main site). */
const HOST_PREFIX: Record<string, string> = {
  "halalme.co.uk": "",
  "www.halalme.co.uk": "",
  "kitchen.halalme.co.uk": "/kitchen",
  "social.halalme.co.uk": "/social",
  "rewards.halalme.co.uk": "/rewards",
  "charity.halalme.co.uk": "/charity",
};

const MAX_URL_LENGTH = 2048;
const DISPLAY_MAX = 48;

// Scheme or www. URLs, plus bare halalme.co.uk links people paste without one.
// Stops at whitespace and characters that can't end a URL in prose.
const URL_RE =
  /\b(?:https?:\/\/[^\s<>"'`]+|www\.[^\s<>"'`]+|(?:[a-z0-9-]+\.)?halalme\.co\.uk(?:\/[^\s<>"'`]*)?)/gi;

// Usernames are 3-20 chars of [a-z0-9_] (validateUsername). The lookbehind-free
// form keeps Safari < 16.4 happy: group 1 is the preceding char, if any.
const MENTION_RE = /(^|[^A-Za-z0-9_@./])@([a-z0-9_]{3,20})(?![A-Za-z0-9_])/g;

const UUID_RE_SRC = "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}";
const RECIPE_PATH_RE = new RegExp(`^/kitchen/recipes/(${UUID_RE_SRC})/?$`);

/** Trailing characters that are almost always sentence punctuation, not URL. */
function trimTrailing(raw: string): string {
  let s = raw;
  for (;;) {
    const last = s.slice(-1);
    if (/[.,;:!?'"]/.test(last)) { s = s.slice(0, -1); continue; }
    // Drop a closing bracket only when it is unbalanced inside the URL, so
    // en.wikipedia.org/wiki/Foo_(bar) survives but "(see https://x.y)" doesn't.
    if (last === ")" && count(s, "(") < count(s, ")")) { s = s.slice(0, -1); continue; }
    if (last === "]" && count(s, "[") < count(s, "]")) { s = s.slice(0, -1); continue; }
    return s;
  }
}

function count(s: string, ch: string): number {
  let n = 0;
  for (const c of s) if (c === ch) n++;
  return n;
}

/**
 * Parses and vets a candidate URL. Returns null for anything that must not be
 * rendered as a link.
 */
export function parseSafeUrl(raw: string): URL | null {
  if (!raw || raw.length > MAX_URL_LENGTH) return null;
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (url.username || url.password) return null;
  const host = url.hostname;
  if (!host || (!host.includes(".") && host !== "localhost")) return null;
  return url;
}

/**
 * The in-app path for a HalalMe URL, or null if the URL is external.
 * `currentHost` (window.location.host) lets links to the environment you're on
 * (localhost, a preview deployment) count as internal too.
 */
export function internalPathFor(url: URL, currentHost?: string): string | null {
  const host = url.host.toLowerCase();
  let prefix: string | undefined = HOST_PREFIX[url.hostname.toLowerCase()];
  if (prefix === undefined && currentHost && host === currentHost.toLowerCase()) prefix = "";
  if (prefix === undefined) return null;

  let path = url.pathname || "/";
  // Subdomain links already under their prefix (kitchen.../kitchen/x) are left
  // alone, matching the middleware's "already on the right path" rule.
  if (prefix && !path.startsWith(prefix)) path = path === "/" ? prefix : `${prefix}${path}`;
  return `${path}${url.search}${url.hash}`;
}

/** Recipe id if `path` is a recipe detail route. */
export function recipeIdFromPath(path: string): string | null {
  const bare = path.split(/[?#]/)[0];
  const m = RECIPE_PATH_RE.exec(bare);
  return m ? m[1].toLowerCase() : null;
}

/** Short, readable label for a long URL. The full URL stays in href/title. */
export function displayUrl(url: URL): string {
  const base = `${url.hostname.replace(/^www\./, "")}${url.pathname === "/" ? "" : url.pathname}${url.search}`;
  return base.length > DISPLAY_MAX ? `${base.slice(0, DISPLAY_MAX - 1)}…` : base;
}

function pushText(out: TextSegment[], value: string) {
  if (!value) return;
  // Mentions only live inside text runs, never inside URLs.
  let last = 0;
  MENTION_RE.lastIndex = 0;
  for (let m = MENTION_RE.exec(value); m; m = MENTION_RE.exec(value)) {
    const start = m.index + m[1].length;
    if (start > last) out.push({ type: "text", value: value.slice(last, start) });
    out.push({ type: "mention", value: `@${m[2]}`, username: m[2] });
    last = start + 1 + m[2].length;
  }
  if (last < value.length) out.push({ type: "text", value: value.slice(last) });
}

export function tokenizeText(text: string, currentHost?: string): TextSegment[] {
  const out: TextSegment[] = [];
  if (!text) return out;

  let last = 0;
  URL_RE.lastIndex = 0;
  for (let m = URL_RE.exec(text); m; m = URL_RE.exec(text)) {
    const raw = trimTrailing(m[0]);
    const start = m.index;
    const end = start + raw.length;
    // Keep the regex moving from the trimmed end so trailing punctuation is
    // emitted as text rather than swallowed.
    URL_RE.lastIndex = end;

    // "name@halalme.co.uk" is an email, not a link.
    if (start > 0 && text[start - 1] === "@") continue;

    const url = parseSafeUrl(raw);
    if (!url) continue;

    pushText(out, text.slice(last, start));
    const internal = internalPathFor(url, currentHost);
    out.push({
      type: "link",
      value: raw,
      href: internal ?? url.toString(),
      internal: internal !== null,
      display: displayUrl(url),
    });
    last = end;
  }
  pushText(out, text.slice(last));
  return out;
}

/** Recipe ids linked from `text`, in order of appearance, without repeats. */
export function extractRecipeIds(text: string | null | undefined, currentHost?: string): string[] {
  if (!text) return [];
  const ids: string[] = [];
  for (const seg of tokenizeText(text, currentHost)) {
    if (seg.type !== "link" || !seg.internal) continue;
    const id = recipeIdFromPath(seg.href);
    if (id && !ids.includes(id)) ids.push(id);
  }
  return ids;
}
