# HalalMe Admin Panel — Pre-Launch Audit

> **Date:** 2026-06-23
> **Scope:** Overview, Users (list + detail), Merchants (pipeline + detail + commission), Kitchen, Hub (posts + comments), Rewards & Charity (Charities, Donations, Fraud, Rules), Support (inbox + thread), Analytics, plus `layout.tsx`, `adminAuth.ts`, `adminRoles.ts`, `_ui.tsx`, and the `/api/admin/*` route handlers.
> "Soon"-tagged items (Permissions, Audit, Settings) and hidden Phase-2 pillars are treated as out of scope.

## ✅ Resolution status (updated 2026-06-23)

All three **Critical** items have been fixed in code:

- **#1 Audit trail** — added `admin_audit_log` (migration `042_admin_audit_log.sql`), a `logAdminAction()` helper (`src/lib/adminAudit.ts`), wired into every sensitive mutation (user delete/suspend/role/permissions/bulk, recipe & post & comment deletes/flags, merchant create/update/status/publish/deactivate/delete/commission/docs, donation block & refund, charity create/suspend/edit, reward-rule edits), plus a super-admin-only viewer at `/admin/audit` (API `GET /api/admin/audit`) and a live nav entry.
- **#2 Search injection** — added `src/lib/adminSearch.ts` (`ilikeTerm` / `sanitizeSearchTerm`) and applied it to every `.or(...ilike...)` route (users, merchants, charities, recipes, hub posts, hub comments, audit).
- **#3 Merchants pagination** — list route is now server-paginated; new `GET /api/admin/merchants/stats` supplies the rail aggregates; the page no longer loads the whole table into the browser.

> **Deploy step:** ✅ `042_admin_audit_log.sql` has been applied to the database via MCP — the audit log is live.

**High-priority quick wins also fixed:**

- **#4 Server bulk endpoints** — added `/api/admin/recipes/bulk`, `/api/admin/hub/posts/bulk`, `/api/admin/hub/comments/bulk`; Kitchen/Hub now send one request per bulk op (was N) and write a single audit entry per batch.
- **#6 Destructive-action UX** — all 9 native `alert()`s replaced with the shared toast (merchant list + detail); user deletion now requires typing `DELETE` to confirm (matching the merchant-delete friction).
- **#7 Hub post-type filter** — the posts API now returns the canonical type list (`general, recipe, question, review`); the filter is stable and complete instead of page-derived.

**More High items fixed:**

- **#8 Accessibility** — added a shared accessible `Modal` primitive (`role="dialog"`, `aria-modal`, focus trap, Escape-to-close, focus restore, labelled by heading) and migrated the destructive confirm dialogs (user delete/suspend, recipe delete, post delete, comment delete) to it. Remaining modals can adopt the primitive incrementally.
- **#9 Support depth** — internal staff-only notes on tickets (migration `043_support_internal_notes.sql`, RLS-hidden from the requester, excluded from status/preview), a note/reply toggle in the thread, and ticket search in the inbox (subject / requester / delivery ref).
- **#10 Permissions context** — new `AdminProvider` loads `/api/admin/me` + `/api/admin/team` once and exposes `can(module, level)` + `team`; the merchants list, merchant detail and chat thread no longer re-fetch them per mount.

**#5 Reported-content — DONE (full two-sided feature):**

- **DB:** `content_reports` table (migration `044_content_reports.sql`, applied) with per-(content, reporter) dedupe and RLS — users create/read only their own reports; admins manage.
- **User side:** a reusable `ReportModal` + `reportService`; "Report" actions wired into posts (PostCard menu for others' posts), comments (post detail), and recipes (recipe detail), each auth-gated with a reason picker.
- **Admin side:** `GET/PATCH /api/admin/reports` + a shared `ReportsQueue` surfaced as a **"Reported" tab in Hub** (posts + comments) and a **Recipes/Reported toggle in Kitchen**. Each row shows report count + reasons + author, with Hide / Delete / Dismiss actions that reuse the existing moderation endpoints and write to the audit log.

**All 10 High-priority items are now resolved.**

## ✅ Medium items resolved (updated 2026-06-26)

All eight **Medium** items (#11–#18) are now fixed in code:

- **#11 StatCard duplication / tones** — deleted the local `StatCard` copies in Users & Merchants; everything uses the shared `_ui.tsx` component (now carries the optional `onClick`/`active` variant). Added semantic tone names (`brand`, `accent`, `success`, `warning`, `danger`) with the old colour names kept as aliases (no visual change).
- **#12 Decoy `⋮`** — the Merchants list trailing icon is now a `ChevronRight` (matches Users/Kitchen/Hub); the whole row still navigates to detail.
- **#13 Date-range filtering** — new reusable `DateRange` control (`_ui.tsx`) + `parseDateRange` helper (`@/lib/adminFilters`), wired into **Users ("Joined")** and **Donations ("Donated")**, plus a **Custom range** in Analytics (window refactor with an upper bound). Kitchen/Hub/Merchants can adopt the same control incrementally.
- **#14 Mobile cards** — added dedicated `md:hidden` card layouts (table → `hidden md:table`) for **Kitchen, Hub posts, Hub comments, Charities, Fraud**, matching the Users/Merchants pattern.
- **#15 Permissions "Soon"** — replaced with a dedicated **Roles & Permissions** page (`/admin/permissions`, super-admin only): lists every team member with an inline per-module access grid (None/View/Manage across all 7 modules incl. Support), promote/demote, and read-only super-admin rows. Backed by `GET /api/admin/permissions`; edits reuse `PATCH /api/admin/users/[id]`. (Initial pass only de-faked the nav link to a filtered Users view; this is the full screen.)
- **#16 Pagination** — shared control now always shows **"Page X of Y"**, plus an optional **rows-per-page** selector and **jump-to-page**. Wired across all 10 list surfaces via a new `parsePageSize` helper (`@/lib/adminPaging`).
- **#17 Analytics export / comparison** — **CSV export** of the active section (stats + every series), and **vs-previous-period delta chips** on the range-based cards (Users signups, Rewards raised + donations, Kitchen AI sessions). (Materialised-view perf optimisation intentionally deferred — current in-memory aggregation is adequate at launch volumes.)
- **#18 Soft-delete + restore** — content soft-delete for **recipes, posts, comments** (migration `045_soft_delete_content.sql`, applied: `deleted_at`/`deleted_by` + RLS so deleted rows are hidden from public/owner reads; the service-role admin client still sees them). Admin delete now soft-deletes (Trash); a separate `?hard=1` **purge** permanently removes (logged distinctly). Restore + permanent-delete surfaced via a **"Trash" tab** in Kitchen and Hub (posts + comments), with bulk endpoints extended to `restore`/`purge`. `comment_count` is reconciled on soft-delete/restore/purge. Users keep hard-delete (right-to-erasure).

**Low items (#19–#25) remain** — deferred to a later pass. (#19 z-index scale was partially done as a side-effect: a documented `Z` token scale now lives in `_ui.tsx`.)

---

## Headline

This is a genuinely strong, cohesive admin panel. The RBAC model (`requireAdmin(module, level)` on every route, super-admin immutability, self-modification guards) is well-built and consistently applied server-side. The design language is disciplined and the shared loading/empty/error states are excellent. The issues below are mostly **gaps and inconsistencies**, not broken foundations — but several are launch-blockers for a platform handling money, PII, and content moderation.

---

## 🔴 CRITICAL

### 1. No audit trail for any admin action
- **Section:** Platform-wide (all mutating routes)
- **Issue:** Nothing records *who did what, when*. Deleting a user (cascades to all their content), deleting recipes/posts, suspending accounts, blocking donations + issuing refunds, changing commission %, suspending charities, and editing reward rules all execute with **zero persistent log**. The sidebar shows an "Audit" item but it's marked "Soon" and no route writes audit records.
- **Why it matters:** For a platform touching real money (donations, refunds, commission) and PII, this is a compliance, accountability, and incident-response failure. If an admin (or a compromised admin account) deletes 500 users or refunds donations maliciously, there is no forensic record. Multi-admin teams cannot resolve "who changed this."
- **Recommendation:** Add an `admin_audit_log` table (actor_id, action, target_type, target_id, before/after JSON, ip, created_at) and write to it from `requireAdmin` callers on every mutation. Surface it in the Audit page. Ship before launch even in read-only form.
- **Priority:** Critical

### 2. PostgREST filter injection risk in search
- **Section:** Users, Merchants, Kitchen, Hub, Charities (every `.or(...ilike...)`)
- **Issue:** Search terms are interpolated raw into PostgREST filter strings, e.g. `query.or(\`full_name.ilike.%${search}%,email.ilike.%${search}%\`)`. Special characters (`,` `)` `*` `.`) in the term aren't escaped, so a crafted query can break out of the intended filter or alter the OR expression.
- **Why it matters:** At minimum a malformed search throws 500s; at worst it widens the query beyond intended columns. Admin-only surface lowers the severity, but it's still untrusted input reaching a query DSL.
- **Recommendation:** Sanitize/escape the term (strip or percent-encode PostgREST metacharacters) before interpolation, or use parameterized `.ilike()` chains / an RPC with bound params.
- **Priority:** Critical (security)

### 3. Merchants list loads the entire table client-side (no pagination)
- **Section:** Merchants pipeline (`/admin/merchants`)
- **Issue:** Unlike Users/Kitchen/Hub (server-paginated at 25), the merchants page fetches **all** merchants into `allMerchants` to compute the donut, top-cities, counts, "needs attention," and commission-review filters in the browser. Search and several filters are also client-side over the full set.
- **Why it matters:** This is fine at 50 merchants and falls over at 5,000 — slow loads, large payloads, memory, and a UI that degrades exactly as the business succeeds. It also means CSV export only covers what's loaded.
- **Recommendation:** Move to server-side pagination + a dedicated `/api/admin/merchants/stats` aggregate endpoint for the donut/cities/counts. Make search and the commission-review filter server-side.
- **Priority:** Critical (scalability)

---

## 🟠 HIGH

### 4. Bulk actions in Kitchen & Hub are N client-side requests, not a server bulk endpoint
- **Section:** Kitchen, Hub (posts + comments)
- **Issue:** "Bulk publish/hide/verify/feature/delete" loop over selected IDs firing one `fetch` per row via `Promise.allSettled`. Users and Merchants have proper server bulk endpoints; Kitchen/Hub don't.
- **Why it matters:** Selecting 25 rows = 25 round-trips, no atomicity, partial-failure states, and easy to trip rate limits or overwhelm the API. Inconsistent with the rest of the panel.
- **Recommendation:** Add `/api/admin/recipes/bulk` and `/api/admin/hub/{posts,comments}/bulk` endpoints mirroring the users/merchants pattern.
- **Priority:** High

### 5. No incoming "reported content" queue — moderation is purely reactive browsing
- **Section:** Kitchen, Hub
- **Issue:** Moderation works only by an admin manually scrolling/searching all content. There is no surface for **user-submitted reports/flags** of posts, comments, or recipes.
- **Why it matters:** A community feed and AI recipe content at scale *will* produce abuse/haram/spam content. Without a report queue, harmful content is found only by luck or after escalation. This is arguably the core job of "Content Moderation," and it's missing.
- **Recommendation:** Add a reports table + a "Reported" filter/queue with report count, reporter, and reason at the top of Kitchen/Hub.
- **Priority:** High

### 6. Inconsistent destructive-action friction & error UX (`alert()` vs toast vs inline)
- **Section:** Merchant detail, Merchants bulk, Users, Kitchen/Hub
- **Issue:** Failures surface via native `alert()` in merchant detail (document reject, deactivate, note save, stage change) and merchant bulk, but via styled toasts elsewhere. Delete friction is also uneven: **merchant delete requires typing a confirm string; user delete (which hard-deletes the account and cascades all content) requires only a single click.**
- **Why it matters:** `alert()` is jarring and off-brand; uneven confirmation means the *most* destructive action (user deletion) has the *least* friction. Easy to mis-click.
- **Recommendation:** Replace all `alert()` with the shared toast; require type-to-confirm (or at least an explicit checkbox) for user deletion and bulk deletes.
- **Priority:** High

### 7. Hub post-type filter is built from the current page only
- **Section:** Hub → Posts
- **Issue:** `setTypes((prev) => [...new Set([...prev, ...json.posts.map(p => p.post_type)])])` — the type-filter options are derived from whatever post types happen to appear on loaded pages. The filter is incomplete on page 1 and changes as you paginate.
- **Why it matters:** Admins can't reliably filter by a type until they've stumbled across it; the filter set is non-deterministic.
- **Recommendation:** Return the canonical list of post types from the API (distinct query) and render a stable filter.
- **Priority:** High

### 8. Accessibility gaps across modals, menus, and controls
- **Section:** Platform-wide
- **Issue:** Modals lack `role="dialog"`/`aria-modal`, focus trapping, and Esc-to-close (some close on backdrop only). Selection checkboxes are `readOnly` + `pointer-events-none` with the click on the parent — state isn't reliably announced; many icon-only buttons lack `aria-label`; row-as-clickable patterns aren't keyboard reachable; the fixed row-action menu (Users/Kitchen/Hub) isn't keyboard navigable and clamps left but can overflow the bottom edge.
- **Why it matters:** Keyboard/screen-reader admins are effectively locked out of core flows; this is also a legal/procurement risk for a UK platform.
- **Recommendation:** Adopt an accessible dialog primitive (focus trap, Esc, aria), make real checkboxes the interactive element, add aria-labels to icon buttons, and ensure menus are keyboard-operable.
- **Priority:** High

### 9. Support inbox missing core helpdesk capability
- **Section:** Support (inbox + thread)
- **Issue:** No internal/private notes (admin can only message the requester), no canned/saved replies, no SLA or first-response timers, no bulk actions, no proactive ticket creation, no tags/categories, no search, and resolving/closing has no reason capture. Near-live updates are 20–25s polling.
- **Why it matters:** Even a small support team needs collision avoidance (assignment exists — good), internal context, and triage speed. Today every reply is public to the customer and there's no way to leave a teammate a note.
- **Recommendation:** Add internal notes, canned responses, ticket search, and basic SLA indicators. Consider Supabase Realtime for the thread.
- **Priority:** High

### 10. Redundant `/api/admin/me` fetches and two different `canManage` patterns
- **Section:** Merchants list, Merchant detail, Chat thread vs Users/Kitchen/Hub/Charities
- **Issue:** Some pages derive `canManage` from their own list endpoint; others independently `fetch('/api/admin/me')` and read `permissions.merchants === 'manage'`. Several pages also fire `/me` + `/team` on every mount.
- **Why it matters:** Duplicate network calls on each navigation, and two divergent permission-derivation paths that can drift.
- **Recommendation:** Hoist permissions into an admin context/provider (the layout already polls `/me`) and consume it everywhere; standardize `canManage`.
- **Priority:** High

---

## 🟡 MEDIUM

### 11. `StatCard` (and tone tokens) duplicated and already drifting
- **Section:** `_ui.tsx` vs Users/Merchants pages
- **Issue:** `StatCard` is defined in shared `_ui.tsx` but **re-implemented locally** in Users and Merchants, with subtly different styles (label `text-gray-600` vs `text-gray-500`). Tone names are also misleading: `"blue"` renders forest-green and `"purple"` renders amber.
- **Why it matters:** Guaranteed visual drift and confusing maintenance ("why is the purple badge orange?").
- **Recommendation:** Delete the local copies; use the shared component. Rename tones to semantic names (`brand`, `accent`, `success`, `warning`, `danger`).
- **Priority:** Medium

### 12. Merchant table's "⋮" icon is a decoy
- **Section:** Merchants list (desktop)
- **Issue:** The trailing `MoreVertical` icon looks like an actions menu (as it is in Users/Kitchen/Hub) but does nothing — the whole row just navigates to detail.
- **Why it matters:** Inconsistent affordance; admins will click expecting quick actions (assign rep, invite) and get a full navigation instead.
- **Recommendation:** Either make it a real quick-actions menu or replace it with a plain chevron like the other list rows.
- **Priority:** Medium

### 13. No date-range filtering anywhere
- **Section:** Users, Merchants, Donations, Hub, Kitchen
- **Issue:** Lists filter by status/role/type but never by date (joined, registered, donated, posted). Analytics offers only 30d/90d/all.
- **Why it matters:** "Show me users who joined last month" / "donations in December" are everyday admin questions that currently require CSV + spreadsheet.
- **Recommendation:** Add a reusable date-range control to list filters and a custom range to Analytics.
- **Priority:** Medium

### 14. Inconsistent mobile treatment
- **Section:** Kitchen, Hub, Charities, Fraud vs Users, Merchants
- **Issue:** Users and Merchants get dedicated mobile card layouts; Kitchen/Hub/Charities/Fraud fall back to horizontal-scrolling tables with `min-width`.
- **Why it matters:** Moderation-on-mobile is cramped and off-pattern relative to the polished card views elsewhere.
- **Recommendation:** Extend the card pattern (or a shared responsive table) to the remaining modules.
- **Priority:** Medium

### 15. Permissions management is hidden inside User detail while the nav says "Soon"
- **Section:** Navigation vs Users → detail
- **Issue:** Role + per-module permission editing **already exists** in the user detail page, but the "Permissions" nav item is greyed out as "Soon" and links to `/admin/users`.
- **Why it matters:** Discoverability — a super-admin reasonably believes permission management isn't built. The "Soon" label contradicts shipped functionality.
- **Recommendation:** Either point "Permissions" at a real team/permissions view (filter Users to staff + the permission grid) or remove the misleading "Soon" entry.
- **Priority:** Medium

### 16. Pagination lacks page-size control, page numbers, and jump
- **Section:** All list views (`Pagination` in `_ui.tsx`)
- **Issue:** Fixed 25/page, Prev/Next only, "Showing X–Y of N" but no "page 3 of 12," no page-size selector, no jump-to-page.
- **Why it matters:** Reviewing large sets (e.g. 2,000 users) is slow and disorienting.
- **Recommendation:** Add page-size options and current-page indicator.
- **Priority:** Medium

### 17. Analytics: no export, no period comparison, in-memory aggregation
- **Section:** Analytics
- **Issue:** No CSV/PDF export, no "vs previous period" deltas, and aggregates (avg days, top charities, most viewed) are likely computed via full-table reads.
- **Why it matters:** Limits the page's usefulness for reporting and will slow as data grows.
- **Recommendation:** Add export + period comparison; back heavy aggregates with SQL views/materialized views or RPC.
- **Priority:** Medium

### 18. Hard-delete only; no soft-delete/restore for content
- **Section:** Kitchen, Hub, Users
- **Issue:** Deletes are permanent cascades with no recovery window.
- **Why it matters:** Combined with **no audit log (#1)**, a wrong delete is unrecoverable and untraceable.
- **Recommendation:** Soft-delete (status/`deleted_at`) with a restore window for content; reserve hard-delete for a separate, logged step.
- **Priority:** Medium

---

## 🟢 LOW

- **19. Inconsistent z-index scale** (`z-55`, `z-60`, `z-70` arbitrary values across modals/toasts) — formalize a token scale to avoid future stacking bugs.
- **20. Hub has no Refresh button** while every other module's header does — relies on tab-switch/poll. Add for consistency.
- **21. No "next/previous record" navigation** in detail pages (merchant, user, ticket) — admins must return to the list between records.
- **22. No global search / command palette** to jump to a user/merchant/ticket by name across modules.
- **23. CSV exports are unlogged and include PII** (emails) — fine for admins, but pairs poorly with #1; log exports once audit exists.
- **24. Donut/visualizations are color-only** with adjacent labels (OK), but verify palette contrast for the muted greys used in charts.
- **25. Overview "Recent Activity" only renders user/merchant/donation types** (icon map) — other event types fall back to a clock icon; broaden as activity sources grow.

---

## Overall Score

**7.5 / 10** — *Strong, production-grade craftsmanship held back by a few launch-blocking gaps in accountability, moderation intake, and scale.*

The foundations (RBAC, server gating, shared UI, error/empty/loading states, brand consistency) are well above typical internal-tool quality. What's missing is the operational safety net (audit, soft-delete, report queue) and a couple of scale/security issues that won't show in a demo but will bite in production. Fix the Critical/High items and this is comfortably a 9.

---

## Top 10 Improvements to Prioritize Before Launch

1. **Ship an admin audit log** for every mutation (Critical #1).
2. **Sanitize search input** against PostgREST filter injection (Critical #2).
3. **Server-paginate the Merchants list** + aggregate endpoint (Critical #3).
4. **Add a reported-content queue** for Kitchen & Hub (High #5).
5. **Add server bulk endpoints** for Kitchen/Hub (High #4).
6. **Standardize destructive-action UX**: kill `alert()`, add type-to-confirm to user/bulk deletes (High #6).
7. **Fix the Hub post-type filter** to use a canonical list (High #7).
8. **Address core accessibility**: dialog semantics, focus trap, Esc, aria-labels, real checkboxes (High #8).
9. **Add internal notes + canned replies + search to Support** (High #9).
10. **Centralize permissions/`canManage`** in an admin context and remove redundant `/me` calls (High #10).

---

## Major Risks & Concerns

- **Accountability / compliance (highest):** No audit trail on a system that moves money (donations, refunds, commission) and can hard-delete users + all their content. Both an operational and a regulatory exposure.
- **Moderation coverage:** With no user-report intake, harmful content in a public feed + AI recipes is found reactively. Scales badly with growth and is a brand/safety risk.
- **Scalability cliffs:** The Merchants page (full client-side load) and in-memory Analytics aggregation degrade precisely as the business grows. Kitchen/Hub bulk = N requests compounds this.
- **Irreversibility:** Hard-delete + no audit + no soft-delete means a single mistaken or malicious action is permanent and invisible.
- **Operational consistency:** Two `canManage` patterns, duplicated `StatCard`, `alert()` vs toast, decoy "⋮" menu, and "Soon" labels on shipped features create drift and erode trust in the tool as the team grows.

The security *model* is sound — the risks above are about what happens *after* an authorized (or compromised) admin acts, and about scale, not about the gate being bypassable.
