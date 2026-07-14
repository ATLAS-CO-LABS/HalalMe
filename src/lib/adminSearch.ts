// Search-term sanitisation for admin list queries.
//
// Several admin routes build PostgREST `.or(...)` filter strings by interpolating
// the raw search term, e.g. `name.ilike.%term%,email.ilike.%term%`. In that
// grammar a comma separates OR-conditions and parentheses group sub-filters, so
// an unescaped term could inject extra conditions or break the query (500s).
//
// `sanitizeSearchTerm` strips the structural characters (`, ( )`) plus quotes and
// backslashes that could interfere with value quoting. LIKE wildcards (`%` `_`)
// are left intact — they only widen the match, they can't inject a condition.
//
// `ilikeTerm` returns a ready-to-use `%term%` pattern from a sanitised term, or
// `null` when the term is empty after sanitising (so callers can skip the filter).

export function sanitizeSearchTerm(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw.replace(/[,()\\"']/g, " ").replace(/\s+/g, " ").trim();
}

export function ilikeTerm(raw: string | null | undefined): string | null {
  const clean = sanitizeSearchTerm(raw);
  return clean ? `%${clean}%` : null;
}
