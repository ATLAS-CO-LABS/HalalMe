# Admin Panel: TanStack Query Migration (Stage 2)

**Status:** COMPLETE. Day 1 done 2026-08-28, Days 2 and 3 done 2026-09-26.

Deliberately left on plain `adminRequest` (not cached): the charity edit drawer (editable draft), the users CSV export (an action, see item 5), and the Applications detail modal (that tab is not surfaced in the UI; convert it if it ever is).
**Prerequisite:** Stage 1 shipped (commit `71c08e7`). Do not start before reading the Stage 1 section below.

---

## Why this exists

On 27 Aug 2026 the admin panel sat on skeletons forever on mobile. Reloads and wifi toggling did not help. The cause was not Vercel, the browser, or Supabase (that session's Supabase logs showed every request returning 200 in milliseconds).

Every admin loader called bare `fetch()` and cleared its skeleton in `.finally()`. `finally` never runs if a promise never settles, which is exactly what a mobile radio handoff produces: socket open, server gone, `fetch` waits indefinitely.

**Stage 1 (done) fixed the bug.** Stage 2 does not fix a bug. It removes the hand-rolled state plumbing that made the bug possible and hard to see.

### What Stage 1 already gave us (do not rebuild these)

| Thing | Where | Fate in Stage 2 |
|---|---|---|
| `adminRequest()` / `adminFetch()` with a hard deadline | `src/app/admin/_fetch.ts` | Becomes the `queryFn`. Keep. |
| `AdminFetchError`, `isAbortError`, `errorMessage` | same | Keep, unchanged. |
| `LoadError` (message + Retry) | `src/app/admin/_ui.tsx` | Keep. Retry becomes `refetch()`. |
| Sentry reporting, 5xx and timeouts only | `_fetch.ts` `report()` | Keep, unchanged. |

Three details in `_fetch.ts` were found by testing, not by reading. **Do not "simplify" them away:**

1. `adminRequest` **races** its deadline rather than only calling `controller.abort()`. Aborting alone only rejects if `fetch` honours the signal. A promise that never settles is the exact failure being fixed, so the deadline must reject on its own.
2. `report()` wraps `Sentry.captureException` in try/catch. Without it, a throwing Sentry replaces the real error and the call site receives a meaningless `TypeError` instead of "Request timed out".
3. Caller aborts settle immediately through their own racer, so a superseded keystroke does not wait out the deadline and then report a false timeout.

---

## Scope

| | Count |
|---|---|
| Query endpoints (reads) | 27 |
| Mutations (POST / PATCH / DELETE) | ~30 |
| Surfaces to migrate | 22 |
| Files touched | 23 |

**Library:** `@tanstack/react-query` v5 (v5.102.8 at time of writing). Peer deps are `react: ^18 || ^19`; the project is on React 19.2.3, so it is compatible.

**Chosen over SWR** because the admin panel is mutation-heavy and every mutation needs its list refreshed. `invalidateQueries` handles that in one line; SWR's manual `mutate(key)` gets fiddly across many keys. TanStack also passes an `AbortSignal` to the query function automatically and ships devtools, both of which map directly onto the bug class above. Bundle size (~13kb vs SWR's ~4kb) is irrelevant here: admin is staff-only, no SEO, no first-visit budget.

**Scope is the admin panel only, for now.** `PRELAUNCH_CHECKLIST.md` (P2) already recommends TanStack Query for the **whole app**, and it is right to. This document deliberately does not do that, for two reasons: the public site is read-heavy and already works, and a launch week is the wrong time to refactor Kitchen and Social. Treat this migration as the admin-shaped first half of that checklist item, and revisit the public site post-launch as the checklist says.

One difference worth knowing: the checklist's rationale leans on retiring `minDelay()`. **The admin panel does not use `minDelay` anywhere**, so that particular benefit is a public-site benefit only and none of the work below touches it.

---

## Conventions to set once, on Day 1

### Query keys

```
['admin', <module>, <view>, <params>]
```

Examples:

```ts
['admin', 'users', 'list', { page, role, status, search }]
['admin', 'users', 'detail', id]
['admin', 'merchants', 'stats', { mine }]
```

Invalidating `['admin', 'users']` then catches both the list and every detail in one call. Every mutation invalidates at the module level unless there is a reason not to.

### Defaults

```ts
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,        // admin data is not second-critical
      retry: 1,                 // _fetch.ts already has the deadline; one retry is enough
      refetchOnWindowFocus: true,
    },
  },
})
```

`placeholderData: keepPreviousData` is set **per list query**, not globally (changed on Day 1). Globally it would make detail pages briefly render the previous record under the new heading when stepping through records.

`retry` must **not** retry 4xx. A 403 is a permission answer, not a blip:

```ts
retry: (count, err) => count < 1 && !(err instanceof AdminFetchError && err.status >= 400 && err.status < 500)
```

### Loading vs fetching

`isLoading` is the first load only. `isFetching` is any load including background refetches. **Skeletons bind to `isLoading`.** This is what replaces the hand-rolled `silent` flags.

---

## The seven things that are not mechanical

Everything else is find-and-replace. These seven need attention, and they are called out again on the day they land.

### 1. Search debounce inverts (Day 2 and Day 3)

Today the loader is called imperatively and the `useEffect` deps deliberately **exclude** `search`:

```ts
// current
useEffect(() => { fetchRows(page, status, search); }, [page, pageSize, status]);
searchTimer.current = setTimeout(() => { setPage(0); fetchRows(0, status, val); }, 300);
```

With TanStack the key **is** the dependency, so search moves into the key and you debounce the key:

```ts
// target
const [search, setSearch] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState("");
// 300ms after `search` settles: setPage(0); setDebouncedSearch(search);
useQuery({ queryKey: ['admin','users','list',{ page, status, search: debouncedSearch }], ... })
```

Same behaviour, different shape, in **10 list search boxes across 9 files** (hub has two, posts and comments), plus the command palette, which uses its own `debounce` ref rather than `searchTimer`. This is where regressions will hide. Click through every search box.

### 2. Merchants list depends on merchants stats (Day 3)

`src/app/admin/merchants/page.tsx` computes `viewIdsKey` from the stats response, because the "needs attention" and "commission review" views filter by an id-set the stats endpoint returns. `fetchMerchants` takes `statsData` as an argument for that reason.

That becomes a dependent query:

```ts
const stats = useQuery({ queryKey: ['admin','merchants','stats',{ mine }] });
const ids = attentionOnly ? stats.data?.attention.ids : reviewOnly ? stats.data?.reviewPending.ids : undefined;
const list = useQuery({
  queryKey: ['admin','merchants','list',{ page, statusFilter, search, mine, ids }],
  enabled: !attentionOnly && !reviewOnly ? true : !!stats.data,
});
```

Most coupled page in the panel. Most likely to break quietly.

### 3. Polling gets deleted (Day 1)

Three hand-rolled pollers, each manually guarding `document.hidden` and passing a `silent` flag to suppress the skeleton:

| Where | Interval |
|---|---|
| `chat/page.tsx` inbox | 25s |
| `chat/[id]/page.tsx` thread | 20s |
| `AdminProvider.tsx` identity + counts | 30s |

All three become `refetchInterval`. TanStack skips background tabs by default (`refetchIntervalInBackground: false`), so the `document.hidden` guards go too. `AdminProvider`'s `visibilitychange` listener is replaced by `refetchOnWindowFocus`.

### 4. `reloadKey` disappears (Day 1)

`hub/page.tsx` keeps a counter in the parent and passes it as a prop into `PostsView` and `CommentsView` purely to force a refetch. Replace with `invalidateQueries({ queryKey: ['admin','hub'] })` and delete the prop from both components.

### 5. Two categories must NOT be converted

- **CSV exports.** `users/page.tsx`, `merchants/page.tsx` and `analytics/page.tsx` call their list endpoint with `?export=1` and immediately trigger a download. That is an action, not server state. Wrapping it in `useQuery` would cache a download. Leave on plain `adminFetch`.
- **Audit logging.** The fire-and-forget `POST /api/admin/exports` after each download. Leave as-is.

Also protect: `users`, `kitchen`, `hub`, `charities`, `fraud` and `rules` read `canManage` off their **list response** on purpose, because it is server-authoritative. Keep it in the query data. Do not "tidy" it into `AdminProvider`.

### 6. `pageSize` can loop (all three days)

**Ten loaders** do `setPageSize(json.pageSize)`: the server is allowed to clamp the requested page size and the page mirrors the answer back into state.

That is a refetch loop waiting to happen. If `pageSize` is both **in the query key** and **set from the response**, every fetch changes the key, which triggers another fetch.

Keep the two separate:

- The **requested** page size stays in state and goes in the key.
- The **server's** value is read from `query.data.pageSize` for display only. Never write it back to the state that feeds the key.

Affected: `audit`, `chat`, `hub` (x2), `kitchen`, `merchants`, and the Applications / Charities / Donations / Fraud rewards tabs.

### 7. TanStack v5 removed `onSuccess` from `useQuery` (Day 1 and Day 3)

This trips people coming from v4. In **v5**, `onSuccess` / `onError` / `onSettled` were removed from `useQuery`. They still exist on **`useMutation`**, which is where the existing success and error toasts (`flash("ok", ...)`) should go, and that part is easy.

The problem is side effects currently sitting **inside** the loaders. Three of them call `rememberList()`:

| File | Call |
|---|---|
| `chat/page.tsx` | `rememberList("support", ...)` |
| `merchants/page.tsx` | `rememberList("merchants", ...)` |
| `users/page.tsx` | `rememberList("users", ...)` |

That populates the `sessionStorage` the `RecordNav` prev/next stepper reads (`@/lib/adminRecordNav`). With `useQuery` there is no `onSuccess` to hang it on, so it must move into a `useEffect` keyed on the query data:

```ts
useEffect(() => {
  if (data?.conversations) rememberList("support", data.conversations.map((c) => c.id));
}, [data]);
```

Miss this and nothing throws. The stepper just silently stops working on detail pages. Support is Day 1; users and merchants are Day 3.

---

## Day 1 (Slice A): setup + the fragile surfaces

**Goal:** prove the pattern on the four surfaces with hand-rolled polling and `reloadKey`. Biggest deletion, lowest risk.

### Setup

1. `npm i @tanstack/react-query @tanstack/react-query-devtools`
2. New `src/app/admin/_query.tsx`: `AdminQueryProvider` holding the `QueryClient` in `useState` (never construct it at module scope, it would leak across requests), with the defaults above.
3. Mount it in `src/app/admin/layout.tsx`, **outside** `AdminProvider` (which becomes a consumer).
4. Devtools mounted in development only.

### Surfaces

| Surface | Endpoint(s) | Key | Notes |
|---|---|---|---|
| `AdminProvider` | `/api/admin/me`, `/api/admin/team` | `['admin','me']`, `['admin','team']` | Delete the 30s `setInterval`, the `visibilitychange` listener and the `background` param. Keep the `can()` helper and the exported shape identical so no consumer changes. |
| Chat inbox | `/api/admin/support/conversations` | `['admin','support','list',{...}]` | `refetchInterval: 25_000`. Delete the `silent` param. |
| Chat thread | `/api/admin/support/conversations/[id]` | `['admin','support','detail',id]` | `refetchInterval: 20_000`. Reply / status / assign become `useMutation` invalidating `['admin','support']` so the inbox badge updates too. Watch the 404 path: it sets `notFound`, not an error. |
| Hub posts | `/api/admin/hub/posts` | `['admin','hub','posts',{...}]` | Delete `reloadKey` prop. |
| Hub comments | `/api/admin/hub/comments` | `['admin','hub','comments',{...}]` | Same. |
| Hub post preview | `/api/admin/hub/posts/[id]` | `['admin','hub','post',id]` | `enabled: !!previewId`. |
| `_ReportsQueue` | `/api/admin/reports?type=` | `['admin','reports',type]` | Shared component, mounted in **both** hub and kitchen. Converting it touches kitchen's page even though kitchen's own list waits until Day 2. That is fine, the two patterns coexist. |

### Mutations to convert

Hub posts: publish toggle, delete, restore, bulk. Hub comments: delete, restore, bulk. Support: reply, status, priority, assign, delivery reference, delete. Reports: resolve, hide, delete, dismiss.

All invalidate at module level (`['admin','hub']`, `['admin','support']`, `['admin','reports']`).

### Done when

- [ ] `npx tsc --noEmit` clean
- [ ] `npm run lint` problem count unchanged from baseline (51 at time of writing)
- [ ] `npm run build` succeeds
- [ ] Devtools shows the expected keys and no duplicate in-flight queries
- [ ] Chat inbox updates on its own within ~25s with a second tab open
- [ ] Backgrounding the tab stops the polling (check the network panel)
- [ ] Hub refresh button still refreshes both sub-tabs
- [ ] Moderating a post updates the list without a manual refresh
- [ ] Reports queue works in **both** hub and kitchen
- [ ] **`RecordNav` prev/next still works on a support thread** (this is the `rememberList` trap in item 7)
- [ ] Changing rows-per-page on the chat inbox settles instead of looping (item 6, watch the network panel)

---

## Day 2 (Slice B): the simple, repetitive surfaces

**Goal:** volume. Ten surfaces, all standard list-or-detail. Low individual value, but this is where the search-debounce pattern gets rehearsed before Day 3 touches the big files.

### Surfaces

| Surface | Endpoint(s) | Key | Notes |
|---|---|---|---|
| Overview | `/api/admin/overview` | `['admin','overview']` | Simplest. Already on `adminFetch`. The `run`/`load` split added in Stage 1 to dodge the setState-in-effect lint rule can be deleted, `useQuery` does not have that problem. |
| Analytics | `/api/admin/analytics` | `['admin','analytics',{section,range,from,to}]` | All four params in the key. Export stays imperative. |
| Audit | `/api/admin/audit` | `['admin','audit',{page,module,search}]` | **Debounced search.** |
| Permissions | `/api/admin/permissions` | `['admin','permissions']` | Promote / demote / grid edits go through `PATCH /api/admin/users/[id]`, so invalidate `['admin','permissions']` **and** `['admin','users']`. |
| Command palette | `/api/admin/search?q=` | `['admin','search',debouncedTerm]` | **Debounced search**, and the simplest one. Do it first as the practice run. Keeps `timeoutMs: 8000`. `enabled: term.length >= 2`. The `reqId` guard can go, TanStack handles staleness. |
| Kitchen list | `/api/admin/recipes` | `['admin','kitchen','list',{...}]` | **Debounced search.** Trash tab is the same query with `deleted=1` in the key. |
| Kitchen preview | `/api/admin/recipes/[id]` | `['admin','kitchen','recipe',id]` | `enabled: !!previewId`. |
| Kitchen AI usage | `/api/admin/kitchen/ai-usage` | `['admin','kitchen','ai-usage']` | Loaded once today. `staleTime: Infinity` is fine. |
| Rewards: Charities | `/api/admin/charities` + `/[id]` | `['admin','charities',...]` | **Debounced search.** Add / edit / suspend / delete / connect all invalidate `['admin','charities']`. |
| Rewards: Applications | `/api/admin/charity-applications` + `/[id]` | `['admin','charity-apps',...]` | **Debounced search.** |
| Rewards: Donations | `/api/admin/donations` | `['admin','donations',{...}]` | **Debounced search.** Read-only ledger, no mutations. |
| Rewards: Fraud | `/api/admin/donation-flags` + `/[id]` | `['admin','donation-flags',{...}]` | Review action invalidates the list. |
| Rewards: Rules | `/api/admin/reward-rules` | `['admin','reward-rules']` | Single object, no pagination. |

### Done when

- [ ] Same four build / lint / typecheck / devtools checks as Day 1
- [ ] Every search box: type, pause, confirm exactly one request fires after ~300ms
- [ ] Pagination does not flash a skeleton (`placeholderData` working)
- [ ] Analytics range and section switches both refetch
- [ ] CSV export still downloads on users, merchants and analytics, and still writes to the audit log
- [ ] A permissions change is reflected on the users page without a reload

---

## Day 3 (Slice C): the big files

**Goal:** the three largest files and the one genuinely hard query relationship. Deliberately last, so the pattern is settled before touching them.

`merchants/[id]/page.tsx` is 1672 lines, `merchants/page.tsx` is 928, `users/page.tsx` is 613.

### Surfaces

| Surface | Endpoint(s) | Key | Notes |
|---|---|---|---|
| Users list | `/api/admin/users` | `['admin','users','list',{...}]` | **Debounced search.** Date range in the key too. Verify, suspend, delete, bulk all invalidate `['admin','users']`. |
| Users detail | `/api/admin/users/[id]` | `['admin','users','detail',id]` | Five mutations each currently call `load()` on success. All become one `invalidateQueries(['admin','users'])`. |
| Merchants stats | `/api/admin/merchants/stats` | `['admin','merchants','stats',{mine}]` | Load first, list depends on it. |
| Merchants list | `/api/admin/merchants` | `['admin','merchants','list',{...}]` | **The dependent query. See section 2 above.** Also: in the id-set views, search filters loaded rows client-side rather than hitting the server. Preserve that. |
| Merchants detail | `/api/admin/merchants/[id]` | `['admin','merchants','detail',id]` | **Nine mutations** in this one file: six `PATCH /merchants/[id]` variants, `DELETE`, `POST /deactivate`, `POST /publish`. Convert them together, they all invalidate the same key. |
| Merchant documents | `/api/admin/merchants/[id]/documents` | `['admin','merchants','documents',id]` | One mutation (`PATCH /documents/[docId]`, approve / reject), invalidates this key only. Lives in the same file as the nine above, so count ten mutation call sites in `merchants/[id]/page.tsx` total. |
| Commission card | `/api/admin/merchants/[id]/commission` | `['admin','merchants','commission',id]` | Self-contained component. Its `load()` after a decision becomes an invalidate. |

### Done when

- [ ] Same four build / lint / typecheck / devtools checks
- [ ] **Merchants: all four views work.** All, Mine, Needs attention, Commission review. The last two are the id-set views and are the whole risk of this day.
- [ ] Merchants search behaves differently in the id-set views (client-side) than the normal view (server-side), as it does today
- [ ] Approving a merchant refreshes both the list **and** the stats rail
- [ ] `RecordNav` prev/next stepper still works on users, merchants and support detail pages (it reads ids from `sessionStorage` via `@/lib/adminRecordNav`, populated by the list pages, so confirm `rememberList` still runs after the query resolves)
- [ ] Full click-through of the admin panel on a phone, not just desktop

---

## Verification (run every day)

```bash
npx tsc --noEmit          # must be clean
npm run lint              # problem count must not rise above baseline (51)
npm run build             # must succeed
```

The lint baseline matters: Stage 1 introduced zero new problems and Stage 2 should do the same. If the count rises, it is almost certainly an unused import left behind by a conversion.

Also worth repeating the Stage 1 mobile check once at the end: open the panel on a phone, throttle to offline mid-load, and confirm you get "Request timed out after 15s" with a Retry button rather than a skeleton. TanStack must not swallow that.

---

## Rollback

Commit each day separately. The old pattern and the new pattern coexist without conflict, because both go through `_fetch.ts`. A day can be reverted on its own without touching the others.

If something breaks after launch, reverting the day's commit is safe. Reverting Stage 1 is **not** safe, that is the actual bug fix.

---

## Notes

- Do not touch the API route handlers. This is a client-side refactor only.
- Do not change any endpoint's response shape. If a shape looks wrong, note it and keep going.
- `PRELAUNCH_CHECKLIST.md` takes priority over this document. If launch work and this collide, this waits.

Related: `ADMIN_PANEL_PLAN_SUMMARY.md`, `ADMIN_PANEL_AUDIT.md`.
