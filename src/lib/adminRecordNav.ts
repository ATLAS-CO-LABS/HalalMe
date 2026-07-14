// Record-to-record navigation for admin detail pages.
//
// List pages stash their current ordered id sequence in sessionStorage; a detail
// page reads it to offer Prev/Next without going back to the list. Deep-linking
// straight to a detail page (no stored list, or an id not in it) simply yields no
// siblings, so the control hides itself.

const PREFIX = "admin:recordnav:";

export function rememberList(key: string, ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(PREFIX + key, JSON.stringify(ids));
  } catch {
    /* sessionStorage unavailable (private mode / quota) — nav just won't show */
  }
}

export type Siblings = { prevId: string | null; nextId: string | null; index: number; total: number };

export function getSiblings(key: string, currentId: string): Siblings {
  const empty: Siblings = { prevId: null, nextId: null, index: -1, total: 0 };
  if (typeof window === "undefined") return empty;
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    if (!raw) return empty;
    const ids = JSON.parse(raw) as string[];
    const i = ids.indexOf(currentId);
    if (i === -1) return { ...empty, total: ids.length };
    return {
      prevId: i > 0 ? ids[i - 1] : null,
      nextId: i < ids.length - 1 ? ids[i + 1] : null,
      index: i,
      total: ids.length,
    };
  } catch {
    return empty;
  }
}
