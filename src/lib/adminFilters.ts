// Date-range parsing for admin list routes.
//
// List pages expose a From/To date control; the client sends `dateFrom` /
// `dateTo` as `YYYY-MM-DD`. This converts them to ISO bounds (start-of-day /
// end-of-day, UTC) for `.gte()` / `.lte()` on a timestamp column. Malformed
// values are ignored so a bad param can't break the query.

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function parseDateRange(searchParams: URLSearchParams): {
  fromISO: string | null;
  toISO: string | null;
} {
  const from = searchParams.get("dateFrom");
  const to = searchParams.get("dateTo");
  return {
    fromISO: from && DATE_RE.test(from) ? new Date(`${from}T00:00:00.000Z`).toISOString() : null,
    toISO: to && DATE_RE.test(to) ? new Date(`${to}T23:59:59.999Z`).toISOString() : null,
  };
}
