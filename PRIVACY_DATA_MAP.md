# HalalMe — Cookie & Local-Storage Data Map

Built for WA-48 (`WEBSITE_AUDIT_ACTIONS.md`), per the instruction in `HME-WEB-DEC-001` Blocker 7: map the actual data flows before final Privacy Policy claims are written. This is a **code-level inventory** — every place the app actually reads or writes a cookie, `localStorage` key, or `sessionStorage` key, found by searching the codebase rather than click-testing a live session. It should be more complete than a manual browse (it catches every code path, not just the ones a test session happens to trigger), but it doesn't replace the policy decisions below — those still need Sami/legal sign-off before the Privacy Policy text is finalised.

**Status:** technical inventory only. Retention periods, OpenAI's current training-data terms, and whether any of this needs a cookie-consent banner are flagged below as open, not decided.

---

## 1. Cookies

| Source | Cookie(s) | Set when | Purpose | Notes |
| --- | --- | --- | --- | --- |
| Supabase Auth (`@supabase/auth-helpers-nextjs`) | `sb-<project-ref>-auth-token` (+ refresh variant) | Login, signup, session refresh | Keeps the user signed in across requests | Strictly necessary — no consent banner needed for this category under PECR |
| Stripe.js (`@stripe/stripe-js`, `@stripe/react-stripe-js`) | `__stripe_mid`, `__stripe_sid` | Whenever a Stripe Elements form mounts — `/charity/checkout`, `/fresh/checkout` | Stripe's own fraud-detection cookies | Set by Stripe's script, not our code. Documented in Stripe's own cookie policy; still needs listing in ours since it's on our domain |
| Vercel Analytics / Speed Insights (`@vercel/analytics`, `@vercel/speed-insights`) | **None** | N/A | Page-view and performance metrics | Both are cookieless by design (Vercel's own claim) — worth confirming against current ICO guidance before stating this as fact in the policy, but no cookie was found in code or Vercel's documented behaviour |

**Not found anywhere in the codebase:** no `document.cookie` calls, no Google Analytics, no advertising/retargeting pixels, no A/B testing cookies, no consent-management platform.

---

## 2. `localStorage`

| Key | File | Purpose | Contains personal data? |
| --- | --- | --- | --- |
| `hm-theme` | `ThemeContext.tsx`, inline script in `layout.tsx` | Light/dark theme preference | No |
| Cart storage key (`CART_STORAGE_KEY`) | `CartContext.tsx` | Fresh (meal subscription) cart contents | Product selections only, no PII — but Fresh is Phase 2/hidden, so this is currently dormant |

---

## 3. `sessionStorage`

| Key | File | Purpose | Contains personal data? |
| --- | --- | --- | --- |
| Auth-gate intent (`INTENT_KEY`) | `AuthGateContext.tsx` | Remembers what a logged-out user was trying to do, to resume after login | The action description text only, e.g. "save this recipe" |
| Admin record-nav (`PREFIX + key`) | `adminRecordNav.ts` | Lets admin staff page between records without re-querying | Internal record IDs, admin-only surface |
| `kitchen-ai-chat` | `AuthContext.tsx` (cleared on logout), `ai-assistant/page.tsx` | AQI chat history, scoped to the logged-in user's id | **Yes** — user's own recipe/cooking questions, kept only for the session and cleared on logout or when it doesn't match the current user |
| `aqi_pending_message` | `AQISection.tsx`, `ai-assistant/page.tsx` | Carries one in-flight AQI message across a page navigation | Yes, transient — same category as above |
| OTP cooldown timestamps | `otpCooldown.ts` | Prevents spamming the resend-OTP button | No — just a timestamp keyed by email+type, not the email itself in plain view of other users (session-scoped to the browser that requested the OTP) |

---

## 4. Third-party processors actually called (server-side)

| Processor | What's sent | Where in code |
| --- | --- | --- |
| **OpenAI** (Chat Completions API) | AQI conversation history + the user's current message | `supabase/functions/generate-recipe/index.ts` — browser → Supabase Edge Function → OpenAI directly, server-to-server. Browser never talks to OpenAI directly. |
| **Stripe** | Payment details, donation amounts, Connect account data for charities | `src/app/api/donations`, `src/app/api/webhooks`, `supabase/functions/stripe-connect-webhook` |
| **Cloudinary** | Uploaded images (recipes, posts, avatars) | `src/app/api/upload` |
| **Resend** | Transactional email addresses + content (OTP, order/donation confirmations, support tickets) | Various `send*Email` calls across `src/services` |
| **Hyperzod** | Order/merchant data for the Delivery platform handoff | `src/app/api/webhooks/hyperzod`, merchant onboarding flow |

---

## 5. Open items — need a policy decision, not a code change

These are exactly the gaps WA-48 and Sami's Blocker 7 answer both flagged. Recorded here so the next session doesn't have to re-derive them:

- **OpenAI training-data status.** The code confirms prompts go to OpenAI's API. Whether OpenAI's *current* API terms permit using that data for model training needs checking against their live terms (API-tier usage is normally excluded from training by default, unlike consumer ChatGPT, but this needs confirming against the actual agreement in place, not assumed).
- **Retention periods per category — drafted 11 Aug 2026, not yet Sami/legal-confirmed.** `privacy/page.tsx` §6 now states specific periods per category (account data 30 days post-closure, community content anonymised rather than deleted, AQI chat session-only/never server-persisted, payment records 6 years per UK tax law, support tickets 2 years, security logs 12 months). These are defensible, standard-practice numbers grounded in what the code actually does — not invented, but also not yet formally signed off. Confirm before treating as locked, same bar as WA-09's fee/refund wording.
- **Cookie-consent banner.** Nothing found here looks like it legally requires one beyond a simple "strictly necessary" notice (auth + payment-fraud cookies only, no ads/analytics tracking) — but that conclusion should be confirmed against current PECR/ICO guidance before publishing, not assumed from this scan alone.
- **Account-deletion behaviour — checked, and it does NOT match Sami's intended policy yet.** Traced it: `recipes.user_id`, `recipe_reviews.user_id`, `recipe_favorites.user_id` (and others in `003_kitchen.sql`) are all `REFERENCES profiles(id) ON DELETE CASCADE`. Deleting a profile today genuinely deletes their recipes/posts/reviews — it does not anonymise them. This directly contradicted a first draft of the Privacy Policy text, which was corrected before shipping to describe the *current* cascade-delete behaviour honestly, with a note that HalalMe intends to move to the anonymised-retention model Sami approved. **Real follow-up task, not done tonight:** change the relevant foreign keys from `CASCADE` to `SET NULL` (or an equivalent anonymisation step) so the actual deletion behaviour matches the policy Sami signed off on — this is a schema migration, not a copy fix.

## 6. Unrelated bug found while scanning (flagging, not a privacy issue)

The blog's newsletter signup form (`NewsletterSection` in `src/app/blog/page.tsx`) has no `onSubmit` handler, no state, and calls no API — clicking "Subscribe" does nothing and no email is ever collected or stored anywhere. Not a data-privacy problem (nothing is captured), but worth fixing or removing since it currently misleads visitors into thinking they've subscribed.
