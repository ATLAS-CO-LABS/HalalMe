# HalalMe — Halal Trust Model

Built for WA-51 (`WEBSITE_AUDIT_ACTIONS.md`). The original audit's finding: across the site, "halal" currently means eight different things depending on which page you're on — merchant declaration, product certification, scholar verification, recipe provenance, platform values, ethical sourcing, cultural relevance and community trust — collapsed into one generic checkmark. Sami's decision (`HME-WEB-DEC-001`, Blocker 3) is explicit: **no blanket "Scholar Verified" / "100% Halal Verified" claim, ever.** WA-04 already fixed the language sitewide (see that item) to stop implying a single uniform standard. This document is the framework that language was a stopgap for — what each status actually means, and what evidence backs it.

## The eight dimensions

Every public halal-status claim should be traceable to one or more of these. A generic badge that doesn't specify which dimensions it covers is exactly the problem this model exists to fix.

| Dimension | Question it answers | What would satisfy it |
| --- | --- | --- |
| Food status | Is the menu or product represented as halal? | Merchant's own declaration at onboarding |
| Evidence | What documents or declarations were reviewed? | Uploaded certificate, registration, or written declaration on file |
| Certification | Was external certification provided, and what does it cover? | A named certifying body (HMC, HFA, etc.), not just "certified" |
| Premises | Is alcohol or non-halal product present? | Merchant disclosure, site visit notes |
| Handling | Are separation and contamination controls documented? | Merchant disclosure, site visit notes |
| Welfare | Is there evidence supporting animal-welfare claims? | Supplier documentation, where provided |
| Review | Who reviewed the information and when? | A named reviewer and a date, not just a checkmark |
| Conduct | Is the merchant operating responsibly on HalalMe? | Complaint/dispute history, standing on the platform |

**Rule:** never use one broad badge to imply all eight are satisfied. A "Halal-Focused" pill on a marketing page means *food status* only, and should never be read as covering certification or handling too.

## What already exists — real data, not proposed

This is the part worth being precise about, because it changes what's actually buildable right now.

**Delivery merchant onboarding** (`public.merchants` + `public.merchant_documents`, `supabase/migrations/033_merchant_dashboard.sql`) already tracks real evidence per merchant:

| `doc_type` | Maps to dimension | Status workflow |
| --- | --- | --- |
| `halal_certificate` | Certification | `uploaded → under_review → approved/rejected`, with `reviewed_by`, `reviewed_at`, `expires_at` |
| `food_hygiene` | Handling (partial) | Same workflow |
| `food_business_reg` | Evidence | Same workflow |
| `public_liability` | Conduct (partial) | Same workflow |
| `business_proof` | Evidence (optional) | Same workflow |
| `owner_id` | Evidence (optional) | Same workflow |

Admins already review these in `admin/merchants/[id]/page.tsx`. This is genuinely the *Evidence* and *Certification* dimensions, done properly, with a named reviewer and a date — not a fabrication.

**Charity evidence** (WA-42, done 11 Aug 2026) — `legal_name`, `registration_number`, `verification_level`, `verified_at` are now surfaced publicly on `/charity/causes` and the charity detail page. This is the model working end to end: real data in, real evidence shown to the public.

**Where it breaks down: Delivery's public-facing side.** The restaurant listings a customer actually browses and orders from live on `delivery.halalme.co.uk` — a separate Hyperzod white-label platform, not this codebase (see WA-32). The merchant evidence described above is real, and reviewed by HalalMe staff, but it currently has **no path to the public**: a customer ordering on the Hyperzod platform has no way to see that a given restaurant's halal certificate was reviewed and approved, because that platform doesn't read from `merchant_documents` at all. This codebase's own `/delivery` marketing page shows a static hardcoded restaurant list (`restaurants` array in `delivery/page.tsx`), not live Hyperzod data — so there's no page in this codebase where per-restaurant evidence could even be surfaced today either.

## What this means for WA-04's badges (already applied)

The generic "Halal-Focused" / "Halal Status Reviewed" language shipped in WA-04 is the correct interim state given the above: it describes the *process* (declaration + review at onboarding) honestly, without claiming a specific certification, premises check, or welfare standard that hasn't been individually verified and surfaced. It intentionally does not claim more than dimension 1 (Food status) plus a general nod to dimension 7 (Review) — which is true today.

## What's not built, and why it's not a copy fix

- **A public per-merchant evidence page** (this is WA-55, "the public trust panel") — would need either a Hyperzod integration to pull real merchant records into this codebase, or a HalalMe-owned merchant directory page fed by `merchant_documents` directly. Both are real integration projects.
- **Handling, Premises and Welfare dimensions** have no structured data field today — `merchant_documents` covers Evidence, Certification and partial Conduct, but there's no `handling_notes` or `welfare_evidence` column. Adding them is a small migration, but only worth doing once there's a UI that would actually display them.
- **A formal Scholar & Halal Advisory Panel** — per Sami's answer, this is a separate future project (a real panel of people, not a database), not something this document or any code change can stand in for.

**Done when** (per the original item): every public status maps to a defined evidence level. **Current state:** true for Charity (built). Not yet true for Delivery's public side — the evidence exists and is reviewed, it just has no public-facing home yet.
