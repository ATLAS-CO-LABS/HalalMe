# Charity Stripe Connect — As-Built Reference

**Status:** ✅ Built & tested in Stripe **sandbox**. Uncommitted on `dev` at time of writing.
**Charge model:** **Direct charges** — the donation is created on the charity's connected account.
**Fee split:** **Charity bears the Stripe processing fee**; HalalMe takes an `application_fee` (default 5%, per-charity).
**Donor visibility:** Non-Ready charities are **hidden entirely** from the rewards section.
**Test charity:** `GHAREEB BC` (`acct_1TojkAJT2J9axSxd`) onboarded to Ready; £100 donation verified.

---

## 1. Why

Before this, **charities received £0** — every donation landed in HalalMe's own Stripe balance,
which is impractical (manual payouts) and a **fiduciary/money-transmission risk**. Stripe Connect
gives each charity its own account; donations flow **directly** to them, HalalMe skims only its
platform fee, and Stripe pays the charity's bank automatically. **HalalMe never holds the funds.**

---

## 2. Money flow (direct charge, charity bears Stripe fee)

Example: **£100** donation, 5% platform fee, paid with the international test card `4242…`.

```
Donor pays £100
      │
      ▼
 CHARITY's Stripe account   ◄── money lands HERE, not HalalMe
      │
      ├─ Stripe fee    −£3.45   (deducted from the charity, natively)
      ├─ Platform fee  −£5.00   ──► application_fee_amount → HalalMe
      │
      ▼
 Charity keeps £91.55  →  auto-paid to their bank by Stripe
```

- **Charity receives** the net; **HalalMe receives** the platform fee; **Stripe** keeps its fee.
- **Fee depends on the card, not a flat rate.** The `4242` test card is billed at the
  international rate (~3.25% + 20p). **Real UK cards are ~1.5% + 20p**, so on £100 the Stripe fee
  is ≈ £1.70 and the charity nets ≈ £93.30 — much better than the test figures suggest.

**How the numbers are recorded (important — not as simple as first planned):**
- On the connected account, `balance_transaction.net` = the charity's true take (amount − Stripe
  fee − application fee). We store that as `net_amount`.
- `stripe_fee_amount` is the **Stripe portion only**, split out of `balance_transaction.fee_details`
  (the `stripe_fee` entries) — because `.fee` on the connected account bundles Stripe fee + our
  application fee.
- The balance transaction can settle **0–2s after** the charge, so the webhook **retries a few
  times in-invocation** (and Stripe-retries as a fallback) until it's ready. See §7-B3.

**Why direct charges (not destination):** the charity is the legal merchant-of-record, natively
bears the Stripe fee, and HalalMe never touches the funds. Trade-off: donation payment events
arrive via the **Connect webhook**, and checkout must init Stripe.js with the charity's account id.

---

## 3. Operational flow (contact → donatable)

```
 OFF-PLATFORM         ADMIN PANEL              STRIPE (hosted)          REWARDS SECTION
 1. Contact charity,  2. "Add charity"         4. Charity enters bank   6. Charity appears,
    collect info         (name, reg#, country,    + ID + charity docs       donatable — money
                          email)                  on Stripe's page          flows to them
                      3. "Send onboarding         (we never see these)
                         link" → Express acct  5. account.updated webhook
                         + emailed link           flips charity to READY
```

**Step 3 is a separate "Send onboarding link" button, not automatic on Add** — so you can review a
charity before inviting, and because links expire (~24h) the same button also **resends**.

**Who collects what:** HalalMe stores name/reg#/country/email; **Stripe** collects and stores all
bank/ID/KYC data — never on HalalMe.

---

## 4. Charity status model

From the `charity_stripe_status` view (`connect_status` / `can_accept_donations`).

| Status | Meaning | Shown to donors? | Can receive £? |
|---|---|---|---|
| 🔴 not connected | Added, no link sent | No (hidden) | No |
| 🟡 pending | Link sent, KYC unfinished | No (hidden) | No |
| 🟢 ready | `stripe_charges_enabled = true` | **Yes** | **Yes** |

Admin sees all three (badge in the list + drawer). Donors only ever see 🟢.

---

## 5. Prerequisites (done in Stripe Dashboard)

1. ✅ **Connect enabled**, platform profile complete, "Enable payments and payouts" active.
2. ✅ **Connect webhook** (`stripe-connect-webhook`) now also listens for `payment_intent.succeeded`,
   `payment_intent.payment_failed`, `charge.refunded` (the direct-charge payment events) — plus its
   original `account.updated` / `account.application.deauthorized`.
3. ✅ Old **`stripe-payments-webhook`** endpoint (platform `stripe-webhook`) **deleted**.

**Edge Function secrets:** `STRIPE_SECRET_KEY`, **`STRIPE_CONNECT_WEBHOOK_SECRET`** (the Connect
webhook uses its own signing secret, distinct from the retired platform webhook's).
**App env reused:** `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `RESEND_API_KEY`,
`NEXT_PUBLIC_SITE_URL`.

---

## 6. Schema used (migration `018_stripe_connect.sql`, already applied — not rebuilt)

`charities`: `stripe_account_id`, `stripe_onboarding_status`, `stripe_charges_enabled`,
`stripe_payouts_enabled`, `stripe_onboarding_url`, `stripe_onboarding_url_expires_at`,
`stripe_onboarding_sent_at`, `stripe_country`, `stripe_default_currency`, `stripe_last_synced_at`.
Also edited via admin: `legal_name`, `registration_number`, `country`, `charity_type` (enum:
ngo/foundation/mosque/humanitarian/other), `contact_email`, `website_url`.

`donations`: `application_fee_amount`, `stripe_charge_id`, plus `platform_fee_amount`,
`stripe_fee_amount`, `net_amount`. `status` also allows `expired` (migration `023`).

View `charity_stripe_status`: `connect_status`, `can_accept_donations` (+ identifying columns).

---

## 7. What was built (as-built file map)

### Part A — Onboarding
| File | What it does |
|---|---|
| **new** `src/lib/charityConnect.ts` | `getStripe()` + `issueCharityOnboardingLink()` — creates the Express account (`type:express`, `business_type:non_profit`, card_payments+transfers, charity MCC 8398) if needed, makes a fresh account link, saves all `stripe_*` fields. Shared by the admin + public routes. |
| **new** `src/app/api/admin/charities/[id]/connect/route.ts` (POST) | Manage-only, audited. Creates/reuses the Express account, issues the link, emails it. **Also serves as "resend"** (no separate refresh route). Partial-success if the email fails (returns the link to copy). |
| **new** `src/app/api/charity-onboarding/refresh/route.ts` (GET, public) | Stripe's `refresh_url` — regenerates an expired link and redirects the charity back into onboarding. |
| **new** `src/app/charity-onboarding/return/page.tsx` (public) | Stripe's `return_url` — "details received / verifying" page. |
| **new** `src/emails/CharityConnectInviteEmail.tsx` + `sendCharityConnectInviteEmail()` in `src/services/emailService.ts` | Onboarding invite email. |
| **new** `src/emails/halalTheme.tsx` | HalalMe **core-brand** email theme (forest green/champagne), separate from the purple `theme.tsx` (Delivery). The invite uses this. *(Not a byte-match to the Supabase OTP template — deferred polish.)* |
| `src/app/api/admin/charities/route.ts` | POST now **requires + validates `contact_email`**. GET list now returns `stripe_account_id`, `stripe_charges_enabled`. |
| `src/app/api/admin/charities/[id]/route.ts` | PATCH now accepts identity fields (`legal_name`, `registration_number`, `country`, `charity_type`, `contact_email`, `website_url`) with validation + reg-number-uniqueness handling. |
| `src/app/admin/rewards/CharitiesTab.tsx` | Add-form requires email/country; edit drawer has an **Identity & contact** section + a **Payouts (Stripe Connect)** section with 🔴/🟡/🟢 status and a **Send / Resend onboarding link** button; **Connect badge in the list rows**. |

### Part B — Direct-charge donations
| File | What it does |
|---|---|
| `src/app/api/donations/create-intent/route.ts` | Creates the PI **on the connected account** (`{ stripeAccount }`) with `application_fee_amount`. **Gate:** refuses (422) unless the charity is Ready. Returns `connected_account_id`. Stores `application_fee_amount`; **no longer seeds `net_amount`** (left null for the webhook). Dedupe/reuse-pending + metadata update also pass `{ stripeAccount }`. |
| `src/app/rewards/checkout/page.tsx` | Initialises Stripe.js with `loadStripe(pk, { stripeAccount: connected_account_id })` so it can confirm the direct charge. |
| `src/app/api/donations/confirm/route.ts` | Simplified to **instant status flip only** (verifies the PI on the connected account, sets `completed` + charge ref). No longer reads fees — the webhook owns fee/net (avoids racing the balance transaction). |
| `supabase/functions/stripe-connect-webhook/index.ts` (**deployed v7**) | Adds `payment_intent.succeeded` / `payment_failed` / `charge.refunded`. Fee handling: retrieves the charge/balance-transaction on the connected account, **retries up to 3× (~1.2s apart)** for the BT to settle, splits `fee_details` for the true Stripe fee, sets `net_amount = bt.net`. Uses **`stripe_fee_amount` as the "fees filled?" sentinel**, can **backfill an already-completed row**, and **returns 500 to trigger Stripe retry** if still not settled. `webhook_events` idempotency; accepts `pending`+`expired`. |

### Part C — Donor gating, admin visibility, cleanup
| File | What it does |
|---|---|
| `src/services/rewardsService.ts` | `getCharities` / `getCharityById` / `getCharityBySlug` / `getCategories` all filter `stripe_charges_enabled = true` → non-Ready charities are hidden from browse, categories, and detail (detail falls through to "Cause Not Found"). |
| (gate) `create-intent` | The `!stripe_charges_enabled → 422` refuse (folded in during Part B) is the server-side guard. |
| `src/app/admin/rewards/CharitiesTab.tsx` | Connect status badge on every list row. |
| **retired** platform `stripe-webhook` | Endpoint deleted in Stripe; local source `supabase/functions/stripe-webhook/index.ts` deleted. Deployed function still exists (receives no traffic) — delete via Supabase dashboard when convenient. |

### Extra — admin money-flow visibility
| File | What it does |
|---|---|
| `src/app/api/admin/donations/route.ts` | Row data now includes `net_amount`, `platform_fee_amount`, `stripe_fee_amount`; stats include `platformFees` (our revenue) + `netToCharities`. |
| `src/app/admin/rewards/DonationsTab.tsx` | New **Platform Fees** stat card + per-row **To charity / Platform fee / Stripe fee** columns (responsive). |

---

## 8. Verified end-to-end (sandbox)

- Onboarding: link emailed → Stripe test onboarding → `account.updated` flips GHAREEB BC to 🟢 Ready.
- £100 donation: charged on the charity's account, `net £91.55`, `platform_fee £5.00`,
  `stripe_fee £3.45`, points awarded once, no duplicates.
- Gate: donations to non-Ready charities refused; those charities hidden from donors.

---

## 9. Known/deferred items

- **Deployed `stripe-webhook` function** still present (no traffic) — delete via dashboard for tidiness.
- **Invite email** is HalalMe-branded but not a pixel-match to the Supabase OTP template (deferred; founder OK).
- **Fee-timing:** a rare donation may show null fees for a few seconds until the balance transaction
  settles; the in-webhook retry + Stripe-retry backfills it automatically — **no manual action needed.**
  (A handful of pre-fix test rows remain null — test noise only; new donations self-heal.)
- **Multi-country / statement descriptor:** Express + non_profit, default country `GB`; charity's
  name shows on the donor's statement (appropriate for donations).
- **Go-live:** everything above is in Stripe **sandbox**. Switching to live needs live keys +
  re-creating the Connect webhook against the live endpoint, and real charities re-onboarding.
