# HalalMe — Merchant Dashboard & Verification: 2-Day Implementation Plan

> **Goal:** Turn the merchant side from a black box into a self-serve dashboard.
> After the 3-step form, a merchant gets a login, sees exactly where they are in
> onboarding, uploads UK compliance documents for our team to verify, and can
> contact support — all under **one account**, sharing the existing auth system.
>
> **Timebox:** 2 days. **Day 1 = today (foundation + auth + dashboard shell).**
> **Day 2 = tomorrow (documents end-to-end + admin review + emails + polish).**
>
> This plan extends — does not replace — [MERCHANT_CRM.md](MERCHANT_CRM.md). The admin
> CRM pipeline, emails, follow-up engine, publish flow already exist and stay as-is.

---

## Table of Contents

1. [Architecture Decisions (locked)](#architecture-decisions-locked)
2. [What already exists](#what-already-exists)
3. [Database schema — migration 033](#database-schema--migration-033)
4. [Status mapping (internal → merchant-facing)](#status-mapping-internal--merchant-facing)
5. [Cloudinary document storage design](#cloudinary-document-storage-design)
6. [Merchant account creation flow](#merchant-account-creation-flow)
7. [DAY 1 — Foundation, Auth, Dashboard Shell](#day-1--foundation-auth-dashboard-shell)
8. [DAY 2 — Documents, Admin Review, Emails, Polish](#day-2--documents-admin-review-emails-polish)
9. [API contracts](#api-contracts)
10. [File manifest](#file-manifest)
11. [Risks & gotchas](#risks--gotchas)
12. [Testing checklist](#testing-checklist)
13. [Out of scope (Phase 2)](#out-of-scope-phase-2)

---

## Architecture Decisions (locked)

These were agreed in planning. Do **not** revisit mid-build.

| # | Decision | Rationale |
|---|---|---|
| 1 | **Merchant is a *relationship*, NOT a role.** `profiles.role` stays `user`/`admin`. "Being a merchant" = owning a row in `merchants` linked by `merchants.user_id`. | A restaurant owner is also a customer. A single-value role forces an either/or; a linked row supports dual identity (and many restaurants per owner later) with zero schema pain. |
| 2 | **One account, two contexts.** Same `auth.users` identity, same login. A header switcher toggles Personal ⇄ Restaurant. Never two logins, never two accounts. | Uber rider/driver model. Matches the "one unified account" brand. |
| 3 | **Passwordless OTP for merchants.** Reuse the existing Supabase email-OTP flow ([verify-otp](src/app/(auth)/verify-otp/page.tsx)). No passwords for merchants. | Reuses 100% of existing auth infra; low friction; the form's email field doubles as email-ownership verification (closes the spam/fake-email gap). |
| 4 | **Documents go to Cloudinary as `authenticated` assets**, delivered via short-lived signed URLs. Store only `public_id` + metadata in Postgres. | Compliance docs (cert/ID/registration) must never sit on a public CDN URL. Reuses existing server-side signed-upload route. |
| 5 | **Verification is a derived stage, not a new DB status.** `merchants.status` enum is untouched. Document state lives in `merchant_documents`; "verified" = all required docs approved. | Avoids breaking the admin pipeline/stepper. Merchant-facing tracker maps internal status + doc state into friendly stages. |
| 6 | **Login email = account identity. `business_email` = restaurant contact.** Separate fields. | Eliminates the "form email ≠ account email" mismatch entirely. |

---

## What already exists

| Component | Location | Reuse how |
|---|---|---|
| 3-step merchant form | [src/app/partner/merchant/page.tsx](src/app/partner/merchant/page.tsx) | Add auth-state branch after submit |
| Provision route (creates merchant + Hyperzod + welcome email) | [src/app/api/hyperzod/provision-merchant/route.ts](src/app/api/hyperzod/provision-merchant/route.ts) | Extend to create/link auth user |
| OTP verify page | [src/app/(auth)/verify-otp/page.tsx](src/app/(auth)/verify-otp/page.tsx) | Add `type=merchant` redirect target |
| Auth context (OTP, role, refreshUser) | [src/context/AuthContext.tsx](src/context/AuthContext.tsx) | Unchanged |
| `handle_new_user` trigger auto-creates `profiles` on signup | [supabase/migrations/002_auth_profiles.sql](supabase/migrations/002_auth_profiles.sql#L32) | Profile row appears automatically when we admin-create the auth user |
| Cloudinary signed upload (server-side, auth-gated) | [src/app/api/upload/route.ts](src/app/api/upload/route.ts), [src/lib/cloudinary.ts](src/lib/cloudinary.ts) | Extend for `authenticated` + `raw`/PDF |
| Admin CRM detail (stepper, checklist, publish, Hyperzod sync) | [src/app/admin/merchants/[id]/page.tsx](src/app/admin/merchants/[id]/page.tsx) | Add a Documents review card |
| Resend email service + React Email templates | [src/services/emailService.ts](src/services/emailService.ts), [src/emails/](src/emails/) | Add 2 doc emails + 1 support email |
| Merchant emails (welcome/invite/agreement/live/chase) | [src/emails/](src/emails/) | Unchanged |

---

## Database schema — migration 033

**File:** `supabase/migrations/033_merchant_dashboard.sql`
(Next number after the existing `032_followups.sql`.)

```sql
-- =============================================================================
-- 033_merchant_dashboard.sql
-- Merchant self-serve dashboard: link merchants to auth accounts + document vault
-- =============================================================================

-- ── 1. Link merchant records to an auth account ──────────────────────────────
ALTER TABLE public.merchants
  ADD COLUMN IF NOT EXISTS user_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS business_email TEXT;   -- restaurant contact email (distinct from login email)

-- Backfill: existing rows have no account yet; business_email = current email
UPDATE public.merchants SET business_email = email WHERE business_email IS NULL;

CREATE INDEX IF NOT EXISTS idx_merchants_user_id ON public.merchants(user_id);

-- ── 2. Document vault ────────────────────────────────────────────────────────
-- doc_type values (UK halal food business):
--   food_hygiene        Food Hygiene Rating / local-authority registration
--   halal_certificate   HMC / HFA / supplier halal certification
--   food_business_reg   Local council food business registration
--   public_liability    Public liability insurance certificate
--   business_proof      Companies House / proof of ownership   (optional)
--   owner_id            Photo ID of owner                       (optional)
CREATE TABLE IF NOT EXISTS public.merchant_documents (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id         UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  doc_type            TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'uploaded'
                        CHECK (status IN ('uploaded','under_review','approved','rejected')),
  cloudinary_public_id TEXT NOT NULL,
  resource_type       TEXT NOT NULL DEFAULT 'image',   -- 'image' | 'raw' (PDFs)
  format              TEXT,                              -- pdf, jpg, png…
  file_name           TEXT,
  rejection_reason    TEXT,
  expires_at          DATE,                              -- cert/rating expiry (renewal reminders)
  uploaded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at         TIMESTAMPTZ,
  reviewed_by         UUID REFERENCES auth.users(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_merchant_documents_merchant ON public.merchant_documents(merchant_id);

CREATE TRIGGER merchant_documents_updated_at
  BEFORE UPDATE ON public.merchant_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 3. RLS: merchants table ──────────────────────────────────────────────────
-- Table is currently service-role only (no policies). Add owner + admin access.
-- NOTE: service_role bypasses RLS, so provision route / cron keep working.
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchant owner can read own record"
  ON public.merchants FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Merchant owner can update limited fields"
  ON public.merchants FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
  -- App layer restricts which columns the merchant may change (contact/address only).
  -- status / commission / readiness are written by service role only.

CREATE POLICY "Admins manage all merchants"
  ON public.merchants FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── 4. RLS: merchant_documents ───────────────────────────────────────────────
ALTER TABLE public.merchant_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchant owner reads own documents"
  ON public.merchant_documents FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM merchants m
    WHERE m.id = merchant_documents.merchant_id AND m.user_id = auth.uid()
  ));

CREATE POLICY "Merchant owner inserts own documents"
  ON public.merchant_documents FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM merchants m
    WHERE m.id = merchant_documents.merchant_id AND m.user_id = auth.uid()
  ));

CREATE POLICY "Admins manage all documents"
  ON public.merchant_documents FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
```

> ⚠️ **Approve/reject and signed-URL generation run through the service-role client**
> in route handlers (admin status already verified there), so admin writes never
> depend on the RLS admin policy alone. The merchant-facing reads use the authed
> browser client and rely on the owner RLS policies above.

After applying: regenerate types — `supabase gen types typescript ... > src/types/index.ts`.

---

## Status mapping (internal → merchant-facing)

The merchant never sees internal ops words ("contacted"). `src/lib/merchantStages.ts`
maps DB state into the 5-stage journey the merchant sees, plus a per-stage CTA.

```
INTERNAL merchants.status + doc state          →  MERCHANT-FACING stage + CTA
────────────────────────────────────────────────────────────────────────────
pending  + docs missing/under_review           →  "Verification" · "Upload your documents"
pending  + all required docs approved          →  "Verification ✓" · "Awaiting dashboard invite"
invited                                         →  "Invited" · "Check your email for the Hyperzod invite (check spam)"
contacted | negotiating                         →  "Negotiation" · "Our team is in touch about commission"
agreed                                          →  "Agreed" · "Final checks underway — you'll be live soon"
live                                            →  "Live" · "You're live! Manage orders in your Hyperzod dashboard"
rejected                                        →  "Closed" · "Contact support" (graceful, not a dead end)
```

Tracker UI shows: **Registered → Verification → Invited → Negotiation → Agreed → Live**,
current stage highlighted, completed stages ticked, each with a one-line "what to do next".

---

## Cloudinary document storage design

**You already have the right foundation** — server-side signed uploads via
[/api/upload](src/app/api/upload/route.ts) using `CLOUDINARY_API_SECRET`. Documents reuse the
pattern with three changes.

### 1. Extend `uploadBuffer` ([src/lib/cloudinary.ts](src/lib/cloudinary.ts))
Add `type` and ensure `resource_type` is honoured:
```ts
// in options: add  type?: "upload" | "authenticated";
const stream = cloudinary.uploader.upload_stream(
  {
    folder: options.folder,
    public_id: options.public_id,
    overwrite: options.overwrite ?? false,
    resource_type: options.resource_type ?? "image",
    type: options.type ?? "upload",          // ← documents pass "authenticated"
  },
  /* …callback returns secure_url, public_id, resource_type, format… */
);
```
Also return `resource_type` and `format` from the callback (needed to store + sign later).

### 2. Add a signed-URL helper ([src/lib/cloudinary.ts](src/lib/cloudinary.ts))
```ts
export function signedDocUrl(publicId: string, resourceType: "image" | "raw") {
  return cloudinary.url(publicId, {
    type: "authenticated",
    resource_type: resourceType,
    sign_url: true,
    secure: true,
    expires_at: Math.floor(Date.now() / 1000) + 300, // 5-minute link
  });
}
```
Generated **only** in route handlers behind an auth check — never client-side.

### 3. Fix `deleteAssets` ([src/lib/cloudinary.ts:44](src/lib/cloudinary.ts#L44))
It hardcodes `resource_type: "image"`. Accept `resource_type` + `type: "authenticated"`
so rejected/superseded PDFs can be deleted.

### Layering (defence in depth)
- **File access** → Cloudinary signed, expiring URL (`type: authenticated`).
- **Who can request a signed URL** → RLS on `merchant_documents` (owner) + admin route gate.

### ⚠️ PDF gotcha
Cloudinary blocks PDF/ZIP **public** delivery by default. We deliver via the
**authenticated + signed-URL** path, which sidesteps this. Do **NOT** enable
"Allow delivery of PDF and ZIP files" in Cloudinary settings — that would make
documents publicly reachable, the opposite of what we want. Upload PDFs with
`resource_type: "raw"` (or `"auto"`).

### Upload constraints
- Folder: `halalme/merchant-docs/{merchantId}`.
- Allowed formats: pdf, jpg, jpeg, png, webp. Max 10 MB (existing limit).
- New dedicated route `/api/merchant/documents` (auth-gated, ownership-checked) —
  do **not** widen the public `/api/upload` folder allowlist for this.

---

## Merchant account creation flow

Branches on **whether the submitter is already logged in.**

### Case A — Not logged in (brand-new merchant)
1. Form submits to `/api/hyperzod/provision-merchant` (existing).
2. Route (service role):
   - Creates Hyperzod merchant (existing).
   - `supabase.auth.admin.createUser({ email, email_confirm: true, user_metadata: { full_name: owner_name } })`.
     The `handle_new_user` trigger auto-creates the `profiles` row (role `user`).
   - Inserts the `merchants` row with `user_id = <new auth user id>`, `business_email = email`,
     `status: 'pending'` (existing fields + the link).
   - Sends welcome email (existing).
3. Frontend: on success, call `authService.sendMerchantLoginOtp(email)` (wraps
   `supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } })`),
   then redirect to `/verify-otp?email=…&type=merchant&redirect=/merchant`.
4. Merchant enters the 6-digit code → session created → lands on `/merchant`.

> Email-confirm is set true on admin-create so the OTP login works immediately and
> the form email is proven on first login. If the code never arrives they can
> re-request from the OTP page (existing resend logic).

### Case B — Already logged in (existing ecosystem user becomes a merchant)
1. Form is reached from the dashboard/switcher; the session exists.
2. Provision route detects the session (server client `getUser()`):
   - **Skips** auth-user creation.
   - Inserts the `merchants` row with `user_id = <current user id>`.
3. Frontend redirects straight to `/merchant` (no OTP needed).

### Edge cases to handle in the route
- **Email already an account** but no merchant row → link a merchant row to that
  existing user instead of creating a duplicate user (look up by email via admin API).
- **Email already a merchant** → existing 409 `email_already_registered` (unchanged).
- **Hyperzod sync fails** → still create account + merchant row (existing
  `hyperzod_sync_failed` flag); merchant still gets a dashboard.

---

## DAY 1 — Foundation, Auth, Dashboard Shell

> **Outcome by end of day:** a new merchant can submit the form, receive an OTP,
> log in, and land on a working dashboard that shows their **status tracker**,
> **restaurant info (read + edit basics)**, and a **Contact Support** link.
> Document upload UI can be a stub ("coming up") — wired fully on Day 2.

### 1.1 — Migration 033 + types  *(~45 min)*
- [ ] Write `supabase/migrations/033_merchant_dashboard.sql` (schema above).
- [ ] `supabase db push` (or `mcp__supabase__apply_migration`).
- [ ] Regenerate `src/types/index.ts`.
- [ ] **Acceptance:** `merchants.user_id`, `business_email`, and `merchant_documents`
      exist; RLS policies present; existing admin CRM still loads (service role unaffected).

### 1.2 — Cloudinary library extensions  *(~30 min)*
- [ ] `uploadBuffer`: add `type`, return `resource_type` + `format`.
- [ ] Add `signedDocUrl()`.
- [ ] Fix `deleteAssets` for `raw` + `authenticated`.
- [ ] **Acceptance:** existing avatar/recipe uploads unaffected (defaults preserved).

### 1.3 — Account creation in provision route  *(~1.5 hr)*
- [ ] Read session in [provision-merchant route](src/app/api/hyperzod/provision-merchant/route.ts)
      via server client `getUser()`.
- [ ] Case A: admin-create user + link `user_id`. Case B: link current user.
- [ ] Handle the "email is an existing account" lookup.
- [ ] Return `{ requiresLogin: boolean }` so the form knows whether to OTP or go straight in.
- [ ] **Acceptance:** submitting while logged out creates an auth user + linked merchant;
      submitting while logged in links to the current user; no duplicate users.

### 1.4 — OTP wiring for merchants  *(~45 min)*
- [ ] `authService.sendMerchantLoginOtp(email)` (`signInWithOtp`, `shouldCreateUser:false`).
- [ ] [verify-otp page](src/app/(auth)/verify-otp/page.tsx): accept `type=merchant`,
      verify with `type:"email"`, redirect to `redirect` param (`/merchant`).
- [ ] Update [partner/merchant submit](src/app/partner/merchant/page.tsx#L168) success branch
      per [account flow](#merchant-account-creation-flow).
- [ ] **Acceptance:** end-to-end — form → code email → enter code → `/merchant` while authed.

### 1.5 — Merchant route group + gate + service  *(~1.5 hr)*
- [ ] `src/app/(merchant)/merchant/layout.tsx` — gate: fetch the caller's merchant row
      (`select … where user_id = auth.uid()`); if none → redirect `/select-role`; if
      `isLoading` → spinner (mirror [admin layout](src/app/admin/layout.tsx)).
- [ ] `src/services/merchantService.ts`:
      `getMyMerchant()`, `getMyDocuments()`, `updateMyContactInfo(partial)`,
      `uploadDocument(file, docType, expiresAt?)`, `getSupportContext()`.
- [ ] `src/lib/merchantStages.ts` — the [status mapping](#status-mapping-internal--merchant-facing) + CTA copy.
- [ ] **Acceptance:** a non-merchant hitting `/merchant` is redirected; a merchant sees the shell.

### 1.6 — Dashboard page (shell)  *(~2 hr)*
- [ ] `src/app/(merchant)/merchant/page.tsx`, brand styling (forest/champagne, matches
      [user dashboard](src/app/(protected)/dashboard/page.tsx)).
- [ ] **Status tracker** (Registered → Verification → Invited → Negotiation → Agreed → Live)
      using `merchantStages`, current stage + CTA highlighted.
- [ ] **Restaurant info card** — read-only view + "Edit contact details" (name read-only;
      phone, address, business_email editable → `updateMyContactInfo`, RLS-limited).
- [ ] **Documents card** — Day-1 stub listing required doc types with "Upload (soon)".
- [ ] **Contact Support** — visible entry point (form wired Day 2; Day 1 can be `mailto:` placeholder).
- [ ] **Acceptance:** tracker reflects real status; editing phone/address persists; refresh holds.

### 1.7 — Context switcher  *(~30 min)*
- [ ] If the logged-in user has a merchant row, show a "Restaurant Dashboard" entry in
      the user dashboard/header; on the merchant dashboard show "Personal".
- [ ] Cheap detection: `merchantService.getMyMerchant()` returns null/row.
- [ ] **Acceptance:** a dual user can hop between `/dashboard` and `/merchant` without re-login.

**Day 1 stretch (only if ahead):** start 2.1 (doc upload route).

---

## DAY 2 — Documents, Admin Review, Emails, Polish

> **Outcome by end of day:** merchant uploads each compliance document, sees
> per-document status (under review / approved / rejected-with-reason / re-upload),
> admin reviews and approves/rejects with a reason from the CRM, and both sides get
> the right emails. Contact-support form delivers with merchant context.

### 2.1 — Document upload route + service  *(~1.5 hr)*
- [ ] `POST /api/merchant/documents` (auth-gated): verify caller owns `merchant_id`,
      validate `doc_type`/format/size, `uploadBuffer({ type:"authenticated", resource_type })`
      to `halalme/merchant-docs/{merchantId}`, insert `merchant_documents` row (`status:'uploaded'`).
- [ ] Re-upload supersedes the previous doc of that type (delete old Cloudinary asset via
      fixed `deleteAssets`, or keep history — pick supersede for simplicity).
- [ ] `GET /api/merchant/documents/[docId]/url` → owner-checked `signedDocUrl` (so the
      merchant can re-view their own upload).
- [ ] **Acceptance:** upload lands in Cloudinary as authenticated; row created; public URL 401s.

### 2.2 — Merchant document UI  *(~2 hr)*
- [ ] Replace the Day-1 stub: list required + optional docs, each showing state
      (uploaded → under_review → approved ✓ → rejected ✗ + reason + re-upload).
- [ ] Upload control per doc type; optional **expiry date** input for hygiene/halal certs.
- [ ] Verification progress bar ("3 of 4 required documents approved").
- [ ] When all required docs approved → tracker advances to "Verification ✓ · awaiting invite".
- [ ] **Acceptance:** rejected doc shows the admin's reason and offers re-upload; approving
      the last required doc flips the tracker.

### 2.3 — Admin document review  *(~2.5 hr)*
- [ ] New **"Verification / Documents"** `Card` in [admin merchant detail](src/app/admin/merchants/[id]/page.tsx):
      list each uploaded doc, **View** (opens admin signed URL), expiry, status.
- [ ] **Approve** / **Reject (with reason)** per document.
- [ ] `GET /api/admin/merchants/[id]/documents` — list + admin signed URLs.
- [ ] `PATCH /api/admin/merchants/[id]/documents/[docId]` — `{ action:'approve'|'reject', reason? }`;
      sets `status`, `reviewed_at`, `reviewed_by`; triggers email (2.4).
- [ ] **Soft gate:** show a warning on the "Mark as Invited" step if not all required docs
      are approved (do not hard-block — keep admin override, but make it loud).
- [ ] **Acceptance:** admin views a PDF via signed URL; approve/reject persists and notifies.

### 2.4 — Transition emails  *(~1 hr)*
- [ ] `src/emails/MerchantDocsApprovedEmail.tsx` — "Your documents are verified" (sent when
      the **last required** doc is approved).
- [ ] `src/emails/MerchantDocsActionNeededEmail.tsx` — "A document needs attention" (on reject,
      includes the reason + re-upload link).
- [ ] Wire both in [emailService.ts](src/services/emailService.ts) (mirror existing senders) and
      call from the review PATCH route (fire-and-forget, like the welcome email).
- [ ] **Acceptance:** approving all docs sends the verified email; rejecting sends action-needed with reason.

### 2.5 — Contact Support  *(~45 min)*
- [ ] `POST /api/merchant/support` (auth-gated): attaches merchant id + restaurant name +
      assigned_rep; emails support inbox via Resend.
- [ ] Merchant dashboard support form (subject + message); show assigned rep name if set.
- [ ] **Acceptance:** support email arrives with full merchant context.

### 2.6 — Polish & hardening  *(~1 hr, soak any spare time)*
- [ ] Empty/loading/error states across dashboard (skeletons, matches app convention).
- [ ] Rejected merchant → graceful "Closed · contact support" view, not a dead tracker.
- [ ] Verify RLS: a merchant cannot read another merchant's row or documents (test with 2 accounts).
- [ ] Confirm no `api_secret` or unsigned doc URL ever reaches the client.
- [ ] `npm run lint` + `npm run build` clean.

**Day 2 stretch (Phase-2 candidates, only if ahead):** expiry renewal reminder cron
(reuse [follow-up engine](src/lib/followUps.ts)); abandoned-account nudge; in-dashboard
notification list.

---

## API contracts

| Method & path | Auth | Body / params | Returns |
|---|---|---|---|
| `POST /api/hyperzod/provision-merchant` *(extend)* | public or session | merchant fields | `{ success, merchant_id, requiresLogin }` |
| `POST /api/merchant/documents` | merchant | `multipart: file, doc_type, expires_at?` | `{ document }` |
| `GET  /api/merchant/documents/[docId]/url` | merchant (owner) | — | `{ url }` (5-min signed) |
| `PATCH /api/merchant/me` *(contact edit)* | merchant (owner) | `{ phone?, address?, city?, post_code?, business_email? }` | `{ merchant }` |
| `POST /api/merchant/support` | merchant | `{ subject, message }` | `{ ok }` |
| `GET  /api/admin/merchants/[id]/documents` | admin | — | `{ documents: [...with signed urls] }` |
| `PATCH /api/admin/merchants/[id]/documents/[docId]` | admin | `{ action, reason? }` | `{ document }` |

> Merchant contact edits go through a **route handler with explicit column allowlist**
> (phone/address/city/post_code/business_email), not a raw client update — even though
> RLS permits the row, we don't trust the client to choose columns.

---

## File manifest

**New**
```
supabase/migrations/033_merchant_dashboard.sql
src/lib/merchantStages.ts
src/services/merchantService.ts
src/app/(merchant)/merchant/layout.tsx
src/app/(merchant)/merchant/page.tsx
src/app/api/merchant/documents/route.ts
src/app/api/merchant/documents/[docId]/url/route.ts
src/app/api/merchant/me/route.ts
src/app/api/merchant/support/route.ts
src/app/api/admin/merchants/[id]/documents/route.ts
src/app/api/admin/merchants/[id]/documents/[docId]/route.ts
src/emails/MerchantDocsApprovedEmail.tsx
src/emails/MerchantDocsActionNeededEmail.tsx
```

**Modified**
```
src/lib/cloudinary.ts                          (type, signedDocUrl, deleteAssets)
src/app/api/hyperzod/provision-merchant/route.ts (account creation/link)
src/services/authService.ts                    (sendMerchantLoginOtp)
src/app/(auth)/verify-otp/page.tsx             (type=merchant)
src/app/partner/merchant/page.tsx              (auth-state branch on submit)
src/services/emailService.ts                   (2 doc emails + support)
src/app/admin/merchants/[id]/page.tsx          (Documents review card + invite soft-gate)
src/app/(protected)/dashboard/page.tsx         (context switcher entry)
src/types/index.ts                             (regenerated)
```

---

## Risks & gotchas

| Risk | Mitigation |
|---|---|
| **Enabling RLS on `merchants` breaks admin CRM.** It's currently policy-free + service-role only. | Service role bypasses RLS, so existing service-role routes keep working. Add admin + owner policies (migration 033). Smoke-test the CRM list/detail immediately after migrating. |
| **`onAuthStateChange` deadlock** (documented in [AuthContext](src/context/AuthContext.tsx#L27)). | Do not add auth listeners. Drive merchant login via the existing OTP → `refreshUser()` path. |
| **PDF public delivery blocked / leaked.** | Always `type:"authenticated"` + `resource_type:"raw"`; deliver via `signedDocUrl`. Never flip the Cloudinary PDF-public setting. |
| **Duplicate auth user** when email already exists. | Look up by email via admin API before `createUser`; link instead of create. |
| **Merchant edits sensitive columns** via RLS UPDATE. | Route-handler column allowlist; status/commission/readiness are service-role-only writes. |
| **Two-day scope creep.** | Day 1 ships a usable dashboard even if docs are stubbed. Documents/admin-review are the Day-2 core; emails/support/polish soak spare time. Expiry-cron is explicitly Phase 2. |
| **`signedDocUrl` expiry too short for review.** | 5 min is fine (link opens immediately on click); regenerate on each view. |

---

## Testing checklist

**Auth & account**
- [ ] Logged-out form submit → OTP email → code → `/merchant`.
- [ ] Logged-in ecosystem user → "Register restaurant" → no OTP → `/merchant`; can switch back to `/dashboard`.
- [ ] Re-submitting a registered email → 409, no duplicate user/merchant.
- [ ] Non-merchant hitting `/merchant` → redirected.

**Documents**
- [ ] Upload each doc type (image + PDF); Cloudinary asset is `authenticated`; public URL 401s.
- [ ] Admin views via signed URL; approve → merchant sees ✓; reject → merchant sees reason + re-upload.
- [ ] All required approved → tracker → "Verification ✓"; verified email sent.

**Security (RLS)**
- [ ] Account A cannot read Account B's merchant row or documents (authed browser client).
- [ ] Admin CRM list/detail unaffected after RLS enabled.
- [ ] No `api_secret` / unsigned doc URL in any client bundle or network response.

**Build**
- [ ] `npm run lint` and `npm run build` pass.

---

## Out of scope (Phase 2)

Deferred deliberately — do not build this week:

- Certificate **expiry renewal reminders** (cron over `expires_at`, reuse follow-up engine).
- **Abandoned-account nudge** (account created, no docs uploaded after N days).
- In-dashboard **notification feed** (emails cover Phase 1).
- Multiple restaurants per owner UI (schema already supports it; UI later).
- E-signatures / contract collection, menu/photo pre-upload, AI doc OCR — all Phase 2 per [MERCHANT_CRM.md](MERCHANT_CRM.md#phase-2--deferred-features).

---

*Created: 2026-06-08 · Scope: merchant dashboard + UK compliance verification · Owner: build over 2 days*
```
