# HalalMe Points System — Build Plan

> **Status:** Planning (review complete, not yet started)
> **Source spec:** _HalalMe Rewards & Points System — Full Expanded Design_ (founder doc)
> **This doc:** codebase review + a lean, phased build plan that fits a ~2-week first launch instead of the doc's 8 weeks.

---

## 0. TL;DR

- What exists today is a **donation-only points counter**, not a platform-wide rewards program. ~80% of the doc is unbuilt.
- Before adding anything, we must fix **two foundation cracks**: (1) tier is computed from *spendable balance* (so spending would demote users), and (2) the tier story is told **three inconsistent ways** across the app.
- We build in **2 phases**:
  - **Phase 1 (launch, 7 working days):** foundation fixes + generic earning engine + ~12 earning rules + redemption engine + **Door A** spending (badges/perks — £0 cost) + dashboards. A complete earn-and-spend loop with **zero cash risk**.
  - **Phase 2 (after founder + Hyperzod):** delivery points, **Door B** cash-out (charity/credit/delivery discounts), and all automation (streaks, seasonal multipliers, expiry emails, tier maintenance).
- The doc's ~60 earning rules and ~50 badges are trimmed to **~15 rules / ~12 badges** for launch. The rest become "add a row" config later.

---

## 1. Codebase Review — what exists today

### 1.1 Data model (Supabase)

| Object | File | State |
|---|---|---|
| `profiles.reward_points` + `reward_tier` | [002_auth_profiles.sql](supabase/migrations/002_auth_profiles.sql) | Single balance column doubles as wallet **and** tier driver ⚠️ |
| `sync_reward_tier()` trigger | 002_auth_profiles.sql:58 | Sets tier from `reward_points` (spendable). Thresholds: silver 1000 / gold 5000 / platinum 10000 |
| `reward_rules` (config engine) | [005_rewards.sql](supabase/migrations/005_rewards.sql) | 5 rules seeded (`donation`, `recipe_upload`, `review`, `daily_login`, `referral`). **Only `donation` is wired.** |
| `reward_transactions` (ledger) | 005_rewards.sql:234 | Immutable, signed points, expiry, idempotency indexes. Missing doc fields: `status`/`multiplier`/`balance_after`. |
| `handle_donation_completed()` trigger | [023_badge_awards.sql](supabase/migrations/023_badge_awards.sql) | Awards donation points **and** re-hardcodes tier thresholds (duplicate logic) + 4 donation badges |
| `reward_catalog` / `reward_redemptions` / `reward_discount_codes` | [019_reward_catalog.sql](supabase/migrations/019_reward_catalog.sql) | Full schema + seed items. **Zero code reads/writes them.** |
| `reward_tiers` table | **No migration** — exists only in remote DB | Queried by API; unversioned; has no benefit columns |
| `user_badges` | (referenced by 023) | 4 donation badges only |
| `decrement_reward_points()` | [021_helper_functions.sql](supabase/migrations/021_helper_functions.sql) | Refund helper — reduces `reward_points` |
| Fraud system | [020_fraud_system.sql](supabase/migrations/020_fraud_system.sql) | Donation fraud only (no engagement/velocity caps) |

### 1.2 API routes (`src/app/api/rewards/`)

- `balance` — returns points, tier, next-tier progress, expiring-soon. Reads `profiles` + `reward_tiers`.
- `tiers` — reads `reward_tiers` table.
- `history` — last 50 `reward_transactions`.
- `badges` — reads `user_badges`.
- **No `redeem` route exists.** Spending is entirely unbuilt.

### 1.3 Hyperzod integration ([hyperzodService.ts](src/services/hyperzodService.ts))

- Admin API access via `x-api-key` + `x-tenant`. Today: create customer, create/update/delete merchant.
- Each user's Hyperzod ID is stored on `profiles.hyperzod_customer_id` (24_hyperzod_integration.sql) → **the user↔order link already exists.**
- Inbound webhook [/api/webhooks/hyperzod](src/app/api/webhooks/hyperzod/route.ts) handles **customer-created only**. No order events, no orders table. → Delivery points are blocked on this (Phase 2).

### 1.4 The three dashboards (must reconcile — not add a fourth)

| Surface | File | Tier story it tells |
|---|---|---|
| Main dashboard | [(protected)/dashboard/page.tsx](src/app/(protected)/dashboard/page.tsx) | "Reward Balance" card, reads `reward_points` directly |
| Rewards landing | [rewards/page.tsx](src/app/rewards/page.tsx) | **Donation-based** £ tiers (Bronze £25 … Platinum £1000) |
| My Rewards | [rewards/my-rewards/page.tsx](src/app/rewards/my-rewards/page.tsx) | **Points-based** tiers from API; badges hardcoded (`STATIC_BADGES`, 4 items) |

**Inconsistency to fix:** landing page says tiers come from £ donated; DB + API say points; doc says cumulative points → Diamond. Phase 1 makes **points-based cumulative** the single source of truth.

---

## 2. Locked decisions (from founder discussion)

1. **2 phases**, Phase 1 = launch.
2. **Door A (perks/badges) is IN Phase 1**; **Door B (cash-out) is parked** to Phase 2, pending founder sign-off on spending caps.
3. **Lean scope:** ~15 earning rules, ~12 badges at launch. Rest added later as config.
4. **Diamond naming:** ✅ CONFIRMED — **display-only** mapping. DB value stays `platinum`; UI shows "Diamond" (Al-Amin). No enum migration, fully reversible.
5. **Rules pay points; badges give status** (avoid double-paying for the same action).
6. **Referral:** ✅ CONFIRMED — **deferred to Phase 2**. Its anti-fraud gate ("friend must place a real order before points release") needs order data, which doesn't exist until Phase 2. Shipping it in Phase 1 would either be farmable or half-built.

---

## 3. PHASE 1 — Launch build (complete, cash-safe loop)

### 3A. Foundation fixes (do first — nothing else is safe until done)

**New migration `046_points_foundation.sql`:**

1. **Split wallet vs lifetime points.**
   - Add `profiles.lifetime_points INTEGER NOT NULL DEFAULT 0` (only ever increases; drives tier).
   - `reward_points` stays as the **spendable wallet** (goes up on earn, down on spend).
   - Backfill `lifetime_points` = sum of positive `reward_transactions` per user.
2. **Rewrite tier logic to key off lifetime, in ONE place.**
   - Rewrite `sync_reward_tier()` to read `lifetime_points`, trigger `BEFORE UPDATE OF lifetime_points`.
   - New thresholds (doc, cumulative): silver 1000 / gold 5000 / **diamond 15000**.
   - **Remove** the duplicate hardcoded tier block inside `handle_donation_completed()` (§3B refactors it).
3. **Version the `reward_tiers` table.** Capture the current remote rows into the migration **and** add benefit columns (reserved, mostly unused in P1): `multiplier_pct`, `min_redemption_points`, `monthly_bonus_points`, `free_deliveries`. Only change vs live = `platinum` min_points 10000 → **15000** (displayed "Diamond").
4. **Extend the ledger** (`reward_transactions`): add `status TEXT NOT NULL DEFAULT 'confirmed'` (reserve `'held'` for Phase-2 delivery 48h hold), `multiplier NUMERIC(5,2) NOT NULL DEFAULT 1.0`, `balance_after INTEGER`.
5. **Refund safety:** update `decrement_reward_points()` to reduce **wallet only**, never `lifetime_points` (a refunded donation shouldn't demote a tier).

**Live DB snapshot (captured via MCP, ready for the migration):**

| name | min_points (live → new) | color | ai_requests_per_hour | sort_order |
|---|---|---|---|---|
| bronze | 0 | #92400E | 10 | 1 |
| silver | 1000 | #6B7280 | 20 | 2 |
| gold | 5000 | #B45309 | 30 | 3 |
| platinum ("Diamond") | 10000 → **15000** | #0E7490 | 50 | 4 |

**Migration safety confirmed:** 15 total users, max balance 3,020 pts, distribution 14 bronze / 1 silver. Zero users ≥ 5,000 → the threshold change **demotes nobody**. `lifetime_points` backfill = current `reward_points` (no spending has ever occurred). `profiles.lifetime_points` and the 3 ledger columns do **not** exist yet — all clean adds.

### 3B. Earning engine (the core — replaces hardcoded donation logic)

**New RPC `award_points(p_user_id, p_action, p_reference_id, p_amount, p_meta)`** (SECURITY DEFINER):
- Load active `reward_rules` row for `p_action`; if none → no-op.
- Enforce caps: `max_per_day` (count today's rows via `created_date`), `max_lifetime`.
- Compute points: `fixed` → flat; `per_gbp` → `floor(amount × points_per_unit)`.
- Apply `multiplier` (default 1.0 in P1 — column reserved for tier/seasonal later).
- **Idempotency:** generic partial unique index on `(user_id, action, reference_id)` where `reference_id` not null (one award per post-like, per recipe, etc.). Keep existing daily-login + donation indexes.
- Write `reward_transactions` row (with `balance_after`), then `+points` to **both** `reward_points` and `lifetime_points`.
- Return points awarded.

**Refactor `handle_donation_completed()`** to call `award_points(..., 'donation', donation_id, amount)` instead of its own inline logic (donation becomes "one caller among many").

**Service wrapper** `src/services/pointsService.ts` → `award(action, opts)` calling the RPC via service client, plus `getBalance`, `getHistory`.

### 3C. Lean earning rules (~15) — seed + wire call sites

Seed rows in `reward_rules`; wire each to its app event:

| Action | Points | Cap | Call site | Day |
|---|---|---|---|---|
| `daily_login` (exists) | 10 | 1/day | check-in API pinged on app load | 3 |
| `profile_complete` | 200 | once | DB trigger: `username` + `phone` both fill | 3 |
| `first_post` | 50 | once | hub post create | 4 |
| `daily_post` | 20 | 1/day | hub post create | 4 |
| `recipe_upload` (exists) | 50 | per recipe | kitchen recipe insert | 4 |
| `first_recipe` | 100 | once | kitchen recipe insert | 4 |
| `review` (exists) | 25 | 3/day | review submit | 4 |
| `donation` (exists, wired) | 10/£ | — | donation trigger (refactored) | ✅ |
| `first_donation` | 100 | once | donation trigger | 4 |

**Onboarding = ONE reward (decided).** Real signup flow: form → verify email →
Complete Profile page (photo + phone + username). The app's own "done" marker is
`username`, but Hyperzod-invited users get a username without a phone, so the reliable
"completed onboarding" signal is **`username` AND `phone` both set**. A single
`profile_complete` = 200 pts fires via a **DB trigger** on that transition (photo is
optional on the page, so not required). Fraud-gated by email + a real phone; 200 = the
£2 min redemption so a new user can redeem immediately. Trigger only fires on the
NULL→set transition, so existing accounts are not retro-awarded. Separate
complete_profile/verify_email/verify_phone/add_photo rewards dropped; phone-verify reward
+ stronger gate deferred to Phase 2.

_`referral` deferred to Phase 2 (see §2.6) — its fraud gate needs order data._

### 3D. Redemption engine + Door A catalogue

**New RPC `redeem_reward(p_user_id, p_catalog_item_id)`** (SECURITY DEFINER, atomic):
- Validate: item active, `min_tier_required` met, stock/`max_per_user`, wallet `reward_points >= points_required`.
- Enforce **velocity**: max 3 redemptions / 24h.
- Deduct **wallet only** (never lifetime); write negative `reward_transactions` row (`action='redeem'`, `status='confirmed'`).
- Insert `reward_redemptions` row; decrement stock.
- **Fulfil (Door A only):** award badge / set a perk flag. (Door B fulfilment — charity donation, discount codes — stays disabled.)

**API route** `POST /api/rewards/redeem`.

**Catalogue for launch (Door A — decided menu, all near-£0 cost):**

| Item | Fulfilment | Infra that exists |
|---|---|---|
| **AI power-up** — extra AI recipe generations / temp higher hourly limit | Top up the user's AI allowance for a window | `ai_request_counts` table + hourly limiter + `ai_requests_per_hour` on tiers |
| **Recipe boost** — feature recipe in discover for 7 days | Set a time-boxed featured flag on the recipe | `recipes.is_featured` (038) + Featured query — needs `featured_until` |
| **Profile flair** — name colour / avatar frame / theme | Set a cosmetic field on the profile | New profile cosmetic field(s) + Hub render |
| **Badges** — profile achievements | Insert `user_badges` | `user_badges` + badge engine (§3E) |

**Deactivate** the seeded `kitchen_discount` and `charity_convert` catalog items (`is_active=false`) until Phase 2 — they're Door B / cash.

### 3E. Badge engine (data-driven, ~12 badges)

- New `badges` catalog table (`slug`, `name`, `description`, `icon`, `bonus_points`, `criteria_type`). Seed ~12: the "firsts" (First Bite[P2], First Recipe, First Post, First Giver), a few identity badges, and tier badges (auto on tier-up).
- `award_badge(user, slug)` → insert `user_badges` (idempotent) + optional bonus via `award_points`.
- Wire "firsts" into the same call sites as 3C. Tier badges awarded from the tier trigger.
- Replace `STATIC_BADGES` in my-rewards with a data fetch (earned vs locked from `badges` + `user_badges`).

### 3F. Dashboards — consolidate to 2 pages (DECIDED)

**IA decision:** `/rewards` is the **Charity & Donation pillar landing** (Start Donating, Browse Causes — keep it). The personal points hub moves into a **Rewards tab on the main dashboard**, and **`/rewards/my-rewards` is deleted**. Final structure = 2 pages by purpose:
- **`/dashboard`** — personal home, **tabbed**: `Overview` (services launchpad + quick stats) + `Rewards` (the points hub). Deep-link via `/dashboard?tab=rewards`.
- **`/rewards`** — charity & donation landing (unchanged purpose).

Tasks:
1. **`/api/rewards/balance`** — return `wallet` (`reward_points`), `lifetime_points`, tier + next-tier from new model.
2. **`/dashboard`** — add tabs. **Overview tab**: existing launchpad; the "Reward Balance" card links to `?tab=rewards`. **Rewards tab** (the old my-rewards content, per doc §9):
   - **Points summary:** wallet balance + £ equivalent + tier badge + progress bar to next tier.
   - **Redeem section:** Door A cards (perks/badges), tier-locked items shown but greyed.
   - **Points history:** full ledger, filter Earned / Spent / All, show running balance.
   - **Badges:** data-driven earned vs locked (from `badges` + `user_badges`), replacing the hardcoded `STATIC_BADGES`.
3. **`/rewards`** (landing) — **fix the tier section**: replace donation-£ thresholds with points-based cumulative (Silver 1,000 / Gold 5,000 / Diamond 15,000), rename Platinum→Diamond, update copy from "lifetime donations" to "lifetime points." Repoint its "My Rewards" button → `/dashboard?tab=rewards`.
4. **Delete `/rewards/my-rewards`**; update any remaining links to `/dashboard?tab=rewards`.
5. **Balance-refresh fix:** balance-displaying components re-read after the daily check-in resolves (fixes the "+10 only shows after refresh" race from Day 3 testing).
6. **Points-earned toast:** a global real-time listener on `reward_transactions` (INSERT, own rows, positive points) pops a toast "+X · <reason>" the instant any award lands — catches every earn path (API, DB trigger, background ping) in one place. The in-the-moment feedback that makes earning feel rewarding.

### 3G. Types

Update `Profile` (add `lifetime_points`) and reward types in `src/types/app.ts` + regenerate `src/types/index.ts`.

### Phase 1 — Day-by-day schedule (7 working days)

> Assumes focused full days, no major blockers. **Day 1 prerequisite:** read the live `reward_tiers` table (DB access) to capture its rows into the migration.

| Day | Focus | Deliverables | Milestone |
|---|---|---|---|
| **1** | Foundation migration | `046_points_foundation.sql`: add `lifetime_points` + backfill; rewrite tier logic → keyed off lifetime, new thresholds (S 1k / G 5k / Diamond 15k), single place; version `reward_tiers` + benefit cols; add ledger cols (`status`/`multiplier`/`balance_after`); fix refund helper (wallet-only) | Wallet vs lifetime split done — spending can't demote |
| **2** | Earning engine | `award_points` RPC (caps, fixed/per_gbp, multiplier, idempotency, dual balance, `balance_after`); refactor donation trigger to call it; `pointsService` wrapper | Engine live; donations flow through it |
| **3** | Rules + account wiring | Seed ~12 rules; wire `daily_login`, `complete_profile`, `verify_email`, `verify_phone`, `add_photo` | Log in / complete profile → points land |
| **4** | Hub + Kitchen + badges | Wire `first_post`, `daily_post`, `recipe_upload`, `first_recipe`, `review`; badge catalogue table + `award_badge` + wire "firsts" & tier badges | Earning live across all Phase-1 pillars |
| **5** | Redemption + Door A | `redeem_reward` RPC (validate, tier gate, velocity 3/day, wallet-only deduct); `POST /api/rewards/redeem`; 4 fulfilment handlers (AI power-up, recipe boost via `featured_until`, profile flair field, badge); Door A catalogue live, cash items disabled | Points are spendable — AI/boost/flair/badges |
| **6** | Dashboards + feedback | Update `balance` API; **tab the main dashboard** (Overview + Rewards tab = points summary, redeem cards, history ledger w/ filters, badges earned/locked); **delete `/rewards/my-rewards`** + repoint links to `/dashboard?tab=rewards`; fix `/rewards` landing tiers; **balance-refresh fix** (balance re-reads after the daily check-in, not racing it); **points-earned toast** (real-time listener on the ledger → "+X · reason" pops on every earn); update types | 2 clean pages + instant earn feedback |
| **7** | Test + polish | E2E: sign up → earn across pillars → redeem → verify ledger/tier/badges; bug fixes; `npm run lint` + `build` | Launch-ready |

---

## 4. PHASE 2 — Delivery, Cash-out & Automation (parked)

Gated on **founder cash-out caps** + **Hyperzod order/discount webhooks**.

- **Delivery earning:** extend Hyperzod webhook for `order delivered` → match `hyperzod_customer_id` → `award_points('delivery_order', order_id, total)`. Award on **delivered** only; dedupe on `hyperzod_order_id`; optional 48h `held` status.
- **Door B redemptions (cash):** re-enable `charity_convert` (→ real donation via existing rails), delivery discount codes + fee waivers (Hyperzod discount API), store credit. Add the spending **cap** guardrails.
- **Automation (cron):** login streaks (7/30-day), Ramadan/Eid multipliers, birthday/anniversary, monthly tier bonuses, **tier maintenance** downgrades, **rolling 18-month expiry** sweeper + 30-day/7-day warning emails/push.
- **Referral (full):** `referral` earning rule (200 pts) + first-order bonus (300 pts), gated on the friend placing a real order (fraud protection). Needs referral-code generation + signup attribution + referral hub UI (link, count, leaderboard).
- **Remaining rules & badges** (~45 rules / ~38 badges) — mostly config once the engine exists.

---

## 5. Open decisions & external dependencies

**Decisions needed:**
- ~~Diamond rename~~ — ✅ decided: display-only (§2.4).
- ~~Referral Phase 1 vs 2~~ — ✅ decided: Phase 2 (§2.6).
- ~~Exact Door A perks~~ — ✅ decided: AI power-ups + Recipe boost + Profile flair + Badges (§3D).

**External / not in our control:**
- Founder sign-off on cash-out caps (charity/credit ceilings) → unblocks Door B.
- Hyperzod confirming order-completion webhooks + discount-code API → unblocks delivery.
- Capture live `reward_tiers` rows before writing migration 046.

---

## 6. Economics note (for the founder conversation)

Rough model, 10,000 active users earning ~300 pts/mo → £30k/mo face value, but **breakage (~30%) + cheap-perk steering** cuts real cost to **~£12k/mo (~40% of face)**. Three levers cap exposure: **18-month expiry**, **menu design** (cheap perks vs costly cash-out), and a **charity/credit cap**. Phase 1 has **£0 cash exposure** by design (Door A only).
