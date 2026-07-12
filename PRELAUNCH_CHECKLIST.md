# Pre-Launch Checklist

Audit date: 2026-07-10, branch `dev`, HEAD `7975362`. Check items off as they're completed. Re-run the underlying checks before trusting an old checkmark — this file is a snapshot, not a live status.

---

## P0 — Launch blockers (fix before going live)

- [ ] **Fix the Hyperzod webhook auth bypass.** `src/app/api/webhooks/hyperzod/route.ts:4-9` — `verifySecret()` is hardcoded to `return true`, real signature check is commented out. This endpoint calls `serviceClient.auth.admin.inviteUserByEmail(...)` with zero auth today. Anyone who finds the URL can trigger it.
- [ ] **Switch Stripe to live mode.**
  - [ ] Complete Stripe business verification/activation in the dashboard.
  - [ ] Swap `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to live keys in production env vars.
  - [ ] Recreate the webhook endpoint in Stripe's **live** dashboard pointing at the production URL (test-mode webhooks don't carry over).
  - [ ] Update `STRIPE_CONNECT_WEBHOOK_SECRET` via `supabase secrets set` with the new live signing secret.
  - [ ] Re-onboard every charity through Stripe Connect in live mode — test-mode connected accounts don't exist in live mode.
  - [ ] Run one real transaction end-to-end (small amount, refund after) before opening to the public.
- [ ] **Add CORS restriction.** Next.js API routes are currently open to any origin — no `headers()` config in `next.config.ts`, no CORS handling in `src/middleware.ts` (which explicitly excludes `/api` from its matcher), no manual `Access-Control-Allow-Origin` anywhere.
- [ ] **Add rate limiting (Upstash).** Nothing throttles requests anywhere today. Priority endpoints: `/api/donations/create-intent`, `/api/hyperzod/provision-merchant`, `/api/contact`, `/api/upload`, auth login/signup/OTP, `/api/rewards/daily-checkin`.
- [ ] **Wire up Sentry.** Currently zero Sentry code/config exists (no dependency, no config files). `ErrorBoundary` (`src/components/ErrorBoundary.tsx`) only does `console.error` — production crashes are invisible right now.
- [ ] **Fix the two routes that leak raw error text to the client:**
  - [ ] `src/app/api/upload/route.ts:45-48` — forwards raw Cloudinary SDK error message.
  - [ ] `src/app/api/rewards/redeem/route.ts:24-31` + `src/services/pointsService.ts:69` — forwards raw Postgres error text; fine for expected validation messages, but doesn't distinguish those from unexpected DB errors (e.g. constraint violations) which would also leak.

## P1 — Do before real traffic scales

- [ ] **Fix the 15 lint errors** (`npm run lint`). 4 are `react-hooks/set-state-in-effect` (React 19/Next 16) in `Header.tsx`, `CartContext.tsx`, hub `feed/page.tsx`, `AQISection.tsx` — worth checking for actual double-render bugs, not just silencing.
- [ ] **Write a complete `.env.example`.** Current one documents 5 vars; the app actually uses 22 (Stripe, Cloudinary, Resend, Hyperzod, `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL`, etc.). Whoever provisions prod env vars needs the full list.
- [ ] **Update stale CLAUDE.md details** — says "Next.js 15", `package.json` actually pins `16.1.1`. Env var section is incomplete (see above).
- [ ] **Add a caching layer for hot reads.** Only 2 spots cache anything today (`rewards/tiers` 1hr ISR, one Hyperzod fetch). Everything else — donations, rewards balance, hub feed, kitchen recipes, admin panel — hits the DB fresh every request. Use Upstash for this once it's wired in for rate limiting.
- [ ] **Confirm Supabase OTP expiry setting.** Password reset/signup OTP is fully delegated to Supabase Auth (no custom token logic — good), but the actual expiry duration lives in the Supabase dashboard (Authentication → Email → OTP expiry), not in the repo. Go confirm it's set the way you want (default 3600s/1hr if untouched).
- [ ] **Add indexes to the Fresh `orders`/`meals` tables** (`supabase/migrations/006_fresh.sql`) before Fresh ships — currently zero indexes despite RLS filtering by `user_id` on every query. Not urgent since Fresh is hidden behind the Phase 2 gate.
- [ ] **Add `app/error.tsx` / `app/global-error.tsx`.** Idiomatic Next.js error boundaries don't exist — only a hand-rolled `ErrorBoundary` component. Do this alongside the Sentry wiring so render errors actually get reported.
- [ ] **Be careful with DB migrations vs. app rollback.** Vercel gives free instant rollback to any previous deploy, but migrations run separately (`supabase db push`, manual) — rolling back app code doesn't roll back the database. If a feature ships with both a code change and a migration, know that rolling back the code alone can leave old code running against new schema.

## P2 — Good practice, not blockers

- [ ] **Add a schema validation library (Zod or similar).** No validation library installed; every API route hand-validates its own request body. Works, but inconsistent across ~70 routes.
- [ ] **Add DOMPurify/sanitize-html as defense-in-depth.** Only one `dangerouslySetInnerHTML` in the app (`src/app/blog/[slug]/page.tsx:151`), rendering admin-authored blog content only — low risk today, but there's no sanitization layer if that ever changes (non-technical admin pastes raw HTML, or an admin account is compromised).
- [ ] **Consider TanStack Query** for client-side data fetching — see rationale below. Not a security/scale blocker, but reduces redundant fetches and boilerplate across the whole `useEffect` → `setState` pattern used on every page.
- [ ] **Consider a real background job queue** (Inngest/Trigger.dev/QStash) if async work grows. Today everything is either synchronous request/response or one of two cron mechanisms (Vercel Cron for the daily merchant follow-up, `pg_cron` for DB cleanup jobs). Fine at current scale.
- [ ] **Playwright test suite** for critical flows (auth, checkout/donation, posting in Hub). Not installed yet.
- [ ] **k6 load test** before and during the launch window. Not installed yet.

## Already solid — don't touch

- ✅ RLS / user data isolation — all 44 tables have RLS enabled, policies correctly scope rows to `auth.uid()`, no IDOR found across sampled service-role routes.
- ✅ SQL injection — all DB access goes through the Supabase client (parameterized), no raw SQL string-building anywhere.
- ✅ Database indexing — 87 indexes covering essentially every filter/FK column that matters (except the Fresh gap noted above).
- ✅ Horizontal scaling — no in-memory state assumptions found that would break across multiple serverless instances.
- ✅ Donation / Stripe Connect pipeline — idempotent, signature-verified, re-verifies PaymentIntents server-side.
- ✅ Points system — Phase 1 complete and committed (award/redeem RPC engine, tiers, badges).
- ✅ Git hygiene — clean tree, in sync with origin, no stray uncommitted work.

---

## Why TanStack Query is worth adding (not a blocker, do post-launch)

Every page in this app is a client component doing `useEffect` → fetch → `setState`, with a hand-rolled `minDelay()` to avoid loading flashes (per CLAUDE.md's documented data-loading pattern). TanStack Query would:

- **Cache in the browser** — revisiting a page (e.g. rewards balance) doesn't re-fetch from scratch. This is per-user browser caching, not server-side load reduction (that's still Upstash's job for #10 above), but it kills a lot of redundant same-user re-fetching.
- **Dedupe simultaneous requests** — if the header and a page both need points balance, that's one request instead of two, automatically.
- **Cut boilerplate** — built-in `isLoading`/`isError`/`data`, retry, and background refetch-on-focus, replacing a lot of repeated `useEffect` code and letting `minDelay()` go away.
- **Enable optimistic updates** — likes/follows/reward redemptions can feel instant instead of waiting on a round trip.

It doesn't replace Supabase Realtime (`AppResumeContext` stays as-is) — it's specifically for the request/response data-fetching pattern used across every page today.
