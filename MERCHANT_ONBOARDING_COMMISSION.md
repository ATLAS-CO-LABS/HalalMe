# Merchant Onboarding & Commission Engine

**Status:** Plan (approved direction, not yet built)
**Owner decisions:** locked in this document (see "Locked Decisions")
**Related:** `MERCHANT_CRM.md` (Phase 1 CRM), `src/lib/merchantStages.ts`, `src/app/(merchant)/merchant/page.tsx`, `src/app/admin/merchants/[id]/page.tsx`

---

## 0. The big idea in one line

> A merchant moves through clear onboarding stages. At the Commission stage they use a friendly, chat-style screen that **looks** like a conversation but is really a **calculator** — they tap answers, a rules engine works out a fair commission, and the result is fully explainable. The admin always guards the important gates.

Two important rules that shape everything:

1. **No AI negotiation.** The UI can feel conversational, but the **commission decision is deterministic** (inputs → rules → fixed result). We never let free text or an AI "decide" the rate.
2. **Performance never auto-reduces commission.** Good performance makes a merchant *eligible for review* — it does not silently drop their rate.

---

## 1. Locked Decisions

| # | Decision | Locked value |
|---|----------|--------------|
| 1 | UI style | Conversational (chat-look), **rules engine** decides |
| 2 | Opening commission | **30%** |
| 3 | Standard range | **27.5% – 25%** |
| 4 | Protected threshold | **22%** |
| 5 | Below 22% | Owner-tier review **unless** verified competitor evidence is attached (Price Promise → instant match) |
| 6 | Bot auto-handles (→ Accept → straight to Agreed) | **25%, 27.5%, 30%** |
| 7 | Goes to admin (review card) | Below 25%, "Review Required" (score 36+), or merchant taps Request Review |
| 8 | Question 4 (% paid elsewhere) | **Override trigger**, not a points add |
| 9 | Stage advancement | **Admin drives stages**; merchant Accept on the auto lane is the one exception that auto-advances |
| 10 | Sign-the-contract step | Lives in the **Agreed** stage (not the Commission stage) |
| 11 | Contract review | Merchant ticks + signs in Agreed; **email (chat + PDF contract) is the evidence record**; admin reviews → Live |
| 12 | Evidence + contract storage | Reuse existing merchant document upload system |
| 13 | **Roles (staff vs owner)** | **Skipped for now.** One admin panel, one queue. Tier colours (🟡/🔴) are **labels only** — any admin can approve anything (not enforced) |
| 14 | **Price Promise Guarantee** | Proof of a cheaper competitor contract (UberEats / Deliveroo / JustEat) → match it **on the spot**, no owner needed |
| 15 | DB shape | New **child table** `merchant_commission` (supports Phase 2 history) |
| 16 | 25% floor easy to reach | **Keep as-is** — easy onboarding fuels word-of-mouth (Sami's call) |
| 17 | Phase 2 (order-data review) | Deferred until after a merchant is live; feasible via Hyperzod |

---

## 2. The Onboarding Journey (Option B — per-stage sections)

The dashboard shows the full journey. **The current stage is large and actionable; past stages collapse to a one-line summary; future stages are muted teasers.**

```
┌─────────────────────────────────────────────┐
│  ●───●───●───◐───○───○                        │
│  Reg  Ver  Inv  COMM Agr  Live                │
├─────────────────────────────────────────────┤
│  ✅ Registered      "Joined 2 Jun"            │ ← past = collapsed
│  ✅ Verification    "Docs approved"           │ ← past = collapsed
│  ✅ Invited         "Invite accepted"         │ ← past = collapsed
│                                               │
│  ▶ 🟢 COMMISSION  ← YOU ARE HERE              │ ← current = BIG + actionable
│     [ Commission Review flow — Part 4 ]       │
│                                               │
│  🔒 Agreed   "Next: sign your agreement"      │ ← future = muted teaser
│  🔒 Live     "Next: go live to customers"     │ ← future = muted teaser
└─────────────────────────────────────────────┘
```

### Stage map (internal status → visible stage → what its section shows)

| Internal status (DB) | Visible stage | Dedicated section content |
|----------------------|---------------|---------------------------|
| `pending`            | Registered    | Welcome + "what happens next" |
| `pending` (+ docs)   | Verification  | **Upload documents** (exists today) |
| `invited`            | Invited       | Invite received / accept prompt |
| `contacted` / `negotiating` | Commission | **Commission Review flow** (Phase 1 bot) |
| `agreed`             | Agreed        | **Sign your agreement** + status |
| `live`               | Live          | "You're live" dashboard |
| `rejected`           | (Rejected)    | Reason + contact support |

> Mapping helper already exists in `src/lib/merchantStages.ts` (`getMerchantJourney`, `currentIndexFor`, `ctaFor`). The per-stage section components are the new work.

---

## 3. PHASE 1 — Commission Qualification Engine

### 3.1 What it is

Starting position for **every** merchant: **30%**.
The merchant answers a short set of tap-only questions → each answer carries **points** → total points map to a **fixed** recommended rate → merchant Accepts or Requests Review.

### 3.2 Section A — Instant Qualification (runs during onboarding)

| # | Question | Answer → Score |
|---|----------|----------------|
| 1 | How many operating locations? | 1 → 0 · 2 → +8 · 3–5 → +12 · 6+ → +15 |
| 2 | Approx. monthly delivery orders (all platforms)? | <200 → 0 · 200–500 → +4 · 500–1000 → +8 · 1000+ → +12 |
| 3 | Currently on another delivery platform? | No → 0 · Yes → +4 |
| 4 | **What commission do you pay elsewhere?** | 30%+ → 0 · 25–29% → +3 · **22–24.99% → Review** · **<22% → Price-Match Review** |
| 5 | Consider HalalMe exclusivity? | No → 0 · Yes → +8 |
| 6 | Go live within 7 days? | No → 0 · Yes → +5 |
| 7 | Menu fully ready? | No → 0 · Yes → +4 |
| 8 | How did you hear about HalalMe? | Organic → 0 · Existing Merchant → +6 · Strategic Referral → +10 |

**Question 4 is special — it is an override trigger, not points.**
If the merchant claims they pay **<22%** elsewhere, the flow routes straight to **Price-Match Review** (admin + evidence), regardless of total score. A claim of **22–24.99%** routes to standard **Review**.

### 3.3 Recommendation Engine (score → rate)

| Total Score | Recommended commission |
|-------------|------------------------|
| 0–10        | **30%** |
| 11–20       | **27.5%** |
| 21–35       | **25%** |
| 36+         | **Review Required** (too strong to auto) |

- **Protected threshold:** 22%
- **Below 22%:** competitor evidence + approval only

### 3.4 The lanes (locked — Sami's ladder)

```
              COMMISSION stage — bot calculates rate
                          │
        ┌─────────────────┼──────────────────────┐
   ABOVE 25%          22% – 25%               BELOW 22%
   (25 / 27.5 / 30)   or [Request Review]
        │                 │                       │
   🟢 AUTO lane      🟡 STAFF review        proof attached?
   Merchant Accepts  card in admin panel    ┌─────┴──────┐
        │            any admin approves    yes           no
   ✅ Auto-advances        │            🟢 Price Promise  🔴 OWNER-tier
      to Agreed            │            instant match     card in admin
        │                  │            (no owner)        (label only —
        │                  │                 │             any admin can
        │                  │                 │             still approve)
        └──────────────────┴─────────────────┴─────────────┘
                          ▼
                   AGREED stage (all lanes meet here)
```

**Plain words:**
- **25 / 27.5 / 30%** → merchant accepts, moves on automatically.
- **22–25%** → a review card appears in the admin panel; staff approve.
- **Below 22%** → review card; normally owner-tier, **but** valid competitor proof = instant Price-Promise match.

**No-roles note (locked):** the 🟡/🔴 tiers are **labels only** for now. There is one admin queue and **any admin can approve any card** — we are not technically enforcing "owner-only" yet.

### 3.5 Merchant experience (the conversational screen)

```
🤖 Welcome! Every merchant starts at 30%.
   Let's see if you qualify for a better rate.

   Q1. How many locations?   ○ 1  ○ 2  ○ 3–5  ○ 6+
   Q2. Exclusive with HalalMe?   ○ Yes  ○ No
   Q3. Already on another app?   ○ Yes  ○ No
   ... (Section A, Q1–Q8) ...

   ⏳ Reviewing…

   ┌───────────────────────────────────┐
   │  Your recommended commission:     │
   │            27.5%                  │
   │  Why?                             │
   │   ✓ Multi-site operator           │
   │   ✓ Exclusivity                   │
   │   ✓ Launch ready                  │
   │                                   │
   │  [ Accept & Continue ]            │  (auto lane → Agreed)
   │  [ Request Review ]               │  (→ evidence → admin)
   └───────────────────────────────────┘
```

**Request Review path:**
```
🤖 We can review this further. Tell us more.
   Reason:  ○ I'm on cheaper terms elsewhere   → REQUIRES proof upload
            ○ I have expansion plans          → reason only
            ○ Strategic opportunity           → reason only
            ○ Other                           → reason only
   (Rate you're hoping for — optional)
   →  Submit
🤖 Thanks. Status: Pending Commercial Review.
```

**Proof rule (Sami):** a merchant only needs a **reason** to request review. **Proof is required only when the reason is "cheaper terms elsewhere"** (the Price-Promise case) — every other reason just needs the reason itself.

**Counter rule (Sami):** a counter-offer is **final**. When the admin counters, the merchant sees **Accept only** — there is no second counter and no counter-back. They accept, or the admin resolves it from their side (Approve / Reject).

---

## 4. The Agreed stage (sign the contract)

When a merchant reaches **Agreed** (auto on the safe lane, or admin-set on the review lane), this section appears:

```
▶ 🟢 AGREED  ← YOU ARE HERE
┌─────────────────────────────────────┐
│  🎉 Your rate is locked: 27.5%       │
│                                      │
│  📄 Sign Your Agreement              │
│  ┌────────────────────────────┐      │
│  │  HalalMe Merchant Contract │      │
│  │  Commission: 27.5%         │      │
│  │  [ Review & Sign / Upload ]│      │
│  └────────────────────────────┘      │
│  Status: Awaiting admin review       │
└─────────────────────────────────────┘
```

- Phase 1 contract = **upload + "I agree & sign" tick + timestamp** (e-sign can come later).
- The signed contract becomes a **document** in the existing upload system.
- **Admin reviews the signed contract**, then switches status to **Live** → merchant is pushed to Hyperzod.

---

## 5. Admin panel integration

The admin merchant detail page (`src/app/admin/merchants/[id]/page.tsx`) gains a Commission panel:

```
ADMIN > Merchant: ABC Burgers
┌─────────────────────────────────────┐
│  Opening:        30%                 │
│  Qualification:  24 points           │
│  Recommended:    25%                 │
│  Merchant chose: Request Review      │
│  Requested:      22%                 │
│  Reason:         Existing provider   │
│  Evidence:       📎 uploaded          │
│                                      │
│  [ Approve ] [ Reject ] [ Counter ]  │
└─────────────────────────────────────┘
```

- The decision writes back to the merchant record and updates the merchant's on-screen stage.
- Status transitions stay admin-driven (the existing `PATCH /api/admin/merchants/[id]` STAGE_ORDER + timestamps + emails), with **one addition**: the auto lane lets the *merchant's* Accept set status to `agreed` directly.
- Score breakdown is shown so any decision is explainable and auditable later.

---

## 6. Data model (new fields)

Add a commission/qualification block to the merchant record (or a child `merchant_commission` row — decide at build time). Suggested fields:

```
-- Instant qualification answers (Section A)
store_count            int
monthly_volume_band    text     -- 'lt200' | '200_500' | '500_1000' | 'gt1000'
on_other_platform      bool
existing_commission    text     -- '30plus' | '25_29' | '22_2499' | 'lt22'
exclusivity            bool
launch_ready_7d        bool
menu_ready             bool
referral_source        text     -- 'organic' | 'existing_merchant' | 'strategic'

-- Engine output
qualification_score    int
recommended_commission numeric  -- 30 | 27.5 | 25
commission_lane        text     -- 'auto' | 'review'

-- Review path
requested_commission   numeric  -- merchant's ask (if Request Review)
review_reason          text
review_status          text     -- 'none' | 'pending' | 'approved' | 'rejected' | 'countered'
final_commission       numeric  -- agreed rate after Accept/approval
```

- **Evidence** (competitor proof) = new doc type in `MERCHANT_DOC_TYPES` (`src/lib/merchantStages.ts`), e.g. `competitor_evidence`.
- **Signed contract** = new doc type, e.g. `signed_agreement`.
- `final_commission` syncs to Hyperzod's `commission_percent` via `updateHyperzodMerchant` when the merchant goes Live.

---

## 7. PHASE 2 — Post-live commercial review (order data)

**Not active at launch.** Unlocks only **after** a merchant is live and producing real order data in Hyperzod. Performance here makes a merchant *eligible for review* — it never auto-cuts the rate.

### 7.1 Philosophy

```
Perform  →  become ELIGIBLE for commercial review  →  human decides
(NOT: perform → automatic discount)
```

### 7.2 Section B — Deferred Qualification (unlocks post-live)

| Signal | Threshold | Score |
|--------|-----------|-------|
| Merchant rating | 4.7+ | +5 |
| SLA compliance | 95%+ | +5 |
| Repeat order rate | Top tier | +5 |
| Growth rate | Positive | +5 |
| Store expansion | Additional site | +5 |

These add to the merchant's qualification picture and can **trigger a review**, which an admin then decides — same approval rules and protected threshold (22%) apply.

### 7.3 Data sources (Hyperzod) — confirmed feasible

| Need | Source | Status |
|------|--------|--------|
| Merchant rating | `average_rating` on the merchant object (already returned by `fetchHyperzodMerchant`, and present in order data) | ✅ available now |
| Order counts (total + completed) | **List All Orders** `POST /admin/v1/order/list` — every order is stamped with `merchant_id`; paginated (`per_page: 10`, `total` across all) | ✅ available |
| Order counts (tenant-wide, by status, by date) | **Retrieve Order Stats** `GET /admin/v1/order/stats` (filters by `delivery_timestamp_from/to`) | ✅ for totals, ⚠️ no merchant filter shown |
| Current commission | `commission: { type, value }` on the merchant object | ✅ available |

### 7.4 The one open caveat ⚠️

`List All Orders` docs only show **headers** (X-API-KEY, X-TENANT) — no documented per-merchant filter.

```
Likely:    POST /order/list accepts { merchant_id } in the body
           (even if undocumented) → fast, clean per-merchant counts.
Worst case: no filter → page through all orders and count by merchant_id
           (slow but possible).
```

**Action when Phase 2 starts:** send one test request with `{ "merchant_id": "..." }` and confirm it filters. This is a 2-minute test, **not a blocker**.

### 7.5 How a Phase 2 review flows

```
Live merchant accumulates orders + rating in Hyperzod
        │
   Scheduled/triggered pull:  rating + completed-order count
        │
   Section B score recomputed → if it crosses a review trigger
        │
   Flag appears on ADMIN panel: "Eligible for commercial review"
        │
   Admin decides (Approve / Counter / hold) — protected 22% floor still applies
        │
   If changed → sync new rate to Hyperzod (commission_percent)
```

---

## 8. Build sequence (high level)

1. **DB** — add qualification/commission fields (Section 6); add new doc types (`competitor_evidence`, `signed_agreement`).
2. **Stages** — extend `merchantStages.ts` so each stage exposes its section identity; build per-stage section components (Option B layout).
3. **Commission Review flow** — the conversational, tap-only Section A screen + the deterministic engine (pure function: answers → score → rate → lane).
4. **Accept / lanes** — auto lane sets `agreed`; review lane writes a pending review for admin.
5. **Agreed stage** — sign/upload contract section + status "awaiting admin review".
6. **Admin panel** — commission decision panel (score, breakdown, requested rate, evidence, Approve/Reject/Counter) wired to existing PATCH route; on Live, sync `final_commission` → Hyperzod.
7. **Phase 2 (later)** — confirm per-merchant order filter; build the rating + order-count pull and the Section B eligibility flag on the admin panel.

---

## 9. Open items to confirm before/at build

- [ ] DB shape: extra columns on `merchants` vs. a `merchant_commission` child table.
- [ ] Phase 1 contract: simple tick+timestamp now, real e-sign later?
- [ ] Section A weights confirmed (note: a 1-site shop ticking easy boxes can reach the 25% floor — intentional?).
- [ ] Phase 2: confirm `POST /order/list` accepts `{ merchant_id }` (1 test request).
- [ ] Phase 2: define exact SLA / repeat-rate / growth formulas from Hyperzod fields.
```
