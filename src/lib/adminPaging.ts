// Page-size parsing for admin list routes.
//
// Admin list pages let the operator choose how many rows to load per page. The
// client sends `?pageSize=`; this clamps it to an allow-list so a crafted value
// can't request an unbounded range. Routes echo the resolved size back so the
// client and server agree on the page geometry.

export const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 25;

export function parsePageSize(
  searchParams: URLSearchParams,
  options: readonly number[] = PAGE_SIZE_OPTIONS,
  fallback: number = DEFAULT_PAGE_SIZE,
): number {
  const raw = parseInt(searchParams.get("pageSize") ?? "", 10);
  return options.includes(raw) ? raw : fallback;
}
