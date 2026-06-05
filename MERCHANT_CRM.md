# HalalMe Merchant CRM & Operations System

> **Strategic Principle:** Build operational clarity first. Build intelligence later.
> The bottleneck is NOT AI. The bottleneck is onboarding speed, operational consistency, and merchant visibility.

---

## Table of Contents

1. [Current State](#current-state)
2. [Core Constraint — Hyperzod](#core-constraint--hyperzod)
3. [The 4-Stage Merchant Flow](#the-4-stage-merchant-flow)
4. [Merchant Pipeline Statuses](#merchant-pipeline-statuses)
5. [Email Automation System](#email-automation-system)
6. [Phase 1 — Build List](#phase-1--build-list)
7. [Phase 2 — Deferred Features](#phase-2--deferred-features)
8. [Unified Admin Panel Architecture](#unified-admin-panel-architecture)
9. [Database Schema](#database-schema)
10. [Technical Build Order](#technical-build-order)
11. [Operational SLA Requirements](#operational-sla-requirements)

---

## Current State

### What Exists (Already Built)

| Component | Status | Location |
|---|---|---|
| Merchant registration form | Done | `src/app/partner/merchant/page.tsx` |
| Merchant saved to Supabase | Done | `src/app/api/hyperzod/provision-merchant/route.ts` |
| Merchant created in Hyperzod (status 0) | Done | `src/services/hyperzodService.ts` |
| Hyperzod webhook handler | Done (skeleton) | `src/app/api/webhooks/hyperzod/route.ts` |
| `merchants` table with core fields | Done | `supabase/migrations/028_merchants.sql` |
| Extended merchant columns | Done | `supabase/migrations/029_merchants_columns.sql` |
| Email provider (Resend) | **Chosen, not wired** | — |

### What Is Broken / Missing Right Now

- No welcome email sent on registration (promised in UI, never implemented)
- `contacted_at`, `invited_at`, `activated_at` fields exist in DB but are **never written**
- `commission_percentage` exists but is **never updated** from anywhere
- `notes` field exists but is **never used**
- No admin panel — zero operational visibility
- No Hyperzod bulk export — team invites merchants one by one manually
- No pipeline status tracking beyond `pending`
- No follow-up tasks or reminders
- No readiness checklist before activation
- Webhook HMAC verification is disabled (security gap)

### The Scaling Problem

```
Current manual flow:
Merchant registers → Team searches Hyperzod manually → 
Team sends invite manually → Team tracks commission in their head → 
Team activates manually

Breaks when:
- Merchant volume grows
- Multiple agents involved
- Follow-ups delayed
- Invites forgotten
- Merchants go cold
- Commission tracking inconsistent
```

---

## Core Constraint — Hyperzod

Hyperzod does **not** expose a public API to programmatically send merchant dashboard invitations.

| Capability | Status |
|---|---|
| Merchant creation via API | Automated |
| Merchant invitation | Semi-manual (batch Excel) |
| Merchant activation (status 0→1) | Automatable via API |

**Workaround for Phase 1:** Bulk Excel export from HalalMe admin panel → upload to Hyperzod → Hyperzod sends invite emails to all merchants at once.

**Do NOT attempt to replace Hyperzod in Phase 1.**

```
Hyperzod owns:          HalalMe owns:
- Merchant dashboard    - Merchant acquisition
- Menu infrastructure   - Onboarding
- Ordering layer        - CRM operations
- Delivery ops          - Merchant relationships
                        - Activation flow
                        - Community & rewards
                        - Operational intelligence
```

---

## The 4-Stage Merchant Flow

### Stage 1 — Registration

**Trigger:** Merchant submits form at `/partner/merchant`

**Backend (automated):**
1. Save to Supabase with `status: pending`
2. Create in Hyperzod with `status: 0` (inactive — NOT visible on platform)
3. Send **Welcome Email** immediately (Email #1)

**What the merchant knows:**
- Application received
- Dashboard access will come separately
- Agent will call within 24hrs
- They are NOT live yet

**Key rule:** Merchant created in Hyperzod = has a record, NOT access. Status 0 = invisible on HalalMe delivery.

---

### Stage 2 — Hyperzod Invite (Batch Workflow)

**Trigger:** Admin opens HalalMe admin panel

**Admin workflow (semi-automated, done once or twice daily):**
1. Admin sees all merchants with `status: pending`
2. Clicks **"Export for Hyperzod"**
3. System generates Excel in Hyperzod bulk invite format (columns: Name, Email)
4. Admin uploads Excel to Hyperzod admin panel
5. Hyperzod sends invite emails to all merchants in the batch
6. Admin returns to HalalMe panel, clicks **"Mark as Invited"**
7. All selected merchants flip to `status: invited`
8. System sends **Invite Confirmation Email** (Email #2) to each merchant

**Goal:** Convert a painful manual process into a 2-minute batch operation.

---

### Stage 3 — Agent Call & Commission Discussion

**Trigger:** Agent contacts merchant (outside system, via phone)

**Admin updates in CRM:**
- Commission percentage agreed
- Call notes added
- Status moves: `invited → contacted → negotiating → agreed`
- Follow-up tasks managed with deadlines

**If no contact within 48hrs:**
- Auto reminder sent to assigned sales rep
- Merchant chase email triggered

---

### Stage 4 — Final Activation & Publish

**Trigger:** Admin clicks **"Approve & Publish"** (gated by readiness checklist)

**Readiness checklist (all must be true to unlock button):**
- [ ] Invite accepted by merchant
- [ ] Commission agreed and entered
- [ ] Call notes completed
- [ ] Onboarding verified by agent

**System automatically:**
1. PATCH Hyperzod: merchant `status: 0 → 1` (now visible on HalalMe)
2. Write `activated_at` timestamp
3. Update Supabase `status: live`
4. Send **"You Are Live"** Email (Email #4)

**Goal:** Controlled activation. No incomplete merchants ever go live.

---

## Merchant Pipeline Statuses

```
pending       → Registered, not yet invited to Hyperzod dashboard
  ↓
invited       → Hyperzod invite sent, merchant setting up dashboard
  ↓
contacted     → Agent has spoken to merchant
  ↓
negotiating   → Commission discussion underway
  ↓
agreed        → Commission agreed, readiness checklist being completed
  ↓
live          → Merchant active on HalalMe platform
  
rejected      → Onboarding failed at any stage (commission rejected, 
                merchant unresponsive, quality check failed)
```

---

## Email Automation System

**Provider:** Resend (already chosen)
**Templates:** React Email components

### Email #1 — Welcome / Registration Confirmation

**Trigger:** Immediately on form submission
**Recipient:** Merchant email
**Content:**
- Thank you for applying to HalalMe
- What happens next (the 4-step process overview)
- Dashboard access will be sent separately — do NOT assume you are live
- Our agent will call you within 24 hours
- Contact support email if questions

### Email #2 — Invite Sent Confirmation

**Trigger:** Admin marks batch as "invited" in admin panel
**Recipient:** Merchant email
**Content:**
- Your merchant dashboard invite has been sent
- Check your inbox (including spam) for the Hyperzod invite email
- Use it to set up your login and start preparing your menu
- Important: You are NOT yet live on HalalMe
- Our agent will be in touch shortly to discuss next steps

### Email #3 — Agreement Confirmed

**Trigger:** Admin moves merchant status to `agreed`
**Recipient:** Merchant email
**Content:**
- Commission agreed, thank you
- Final onboarding review underway
- We will notify you once your restaurant is live
- Expected timeline

### Email #4 — You Are Live

**Trigger:** Admin clicks "Approve & Publish" (after checklist passes)
**Recipient:** Merchant email
**Content:**
- Congratulations — your restaurant is now live on HalalMe
- Customers can start ordering
- Link to Hyperzod dashboard for order management
- Support contact details
- Tips for first week (optional)

---

## Phase 1 — Build List

> **Focus: Speed, visibility, operational consistency. NOT advanced AI.**

### Priority 1 — Supabase Migration

**Status:** To do
**File:** `supabase/migrations/030_merchant_crm.sql`

Add to `merchants` table:
- `source_attribution` TEXT — where the lead came from (website, QR, referral, Instagram)
- `assigned_rep` TEXT — name or user ID of assigned sales rep
- `readiness_checklist` JSONB — `{ invite_accepted, commission_agreed, notes_completed, onboarding_verified }`
- Update status values to include all 7 pipeline statuses

---

### Priority 2 — Resend Email Service

**Status:** Provider chosen, not wired
**File:** `src/services/emailService.ts`
**Templates:** `src/emails/` (React Email components)

Wire up 4 email templates:
- `MerchantWelcomeEmail`
- `MerchantInviteSentEmail`
- `MerchantAgreementEmail`
- `MerchantLiveEmail`

Trigger Email #1 from `/api/hyperzod/provision-merchant` route after successful save.

---

### Priority 3 — Admin Panel Shell

**Status:** To do
**Route:** `src/app/admin/`
**Access:** `profiles.role = 'admin'` (role-gated layout)

Sidebar modules:
1. **Merchant CRM** (Priority 1 — build first)
2. User Management (Priority 2)
3. Kitchen Moderation (Priority 3)
4. Hub Moderation (Priority 4)
5. Rewards Management (Priority 5)
6. Analytics (Priority 6)

---

### Priority 4 — Merchant Pipeline Table (Core CRM)

**Status:** To do
**Route:** `src/app/admin/merchants/page.tsx`

Table view columns:
- Restaurant name
- Owner name
- Email
- Postcode
- Status badge (colour-coded)
- Assigned rep
- Days since registration
- Commission %
- Actions

Features:
- Filter by status
- Search by name/email
- Select multiple merchants (for batch operations)
- Click row → merchant detail view

---

### Priority 5 — Hyperzod Export Workflow

**Status:** To do
**Route:** `src/app/api/admin/merchants/export/route.ts`

Logic:
1. Admin selects merchants with `status: pending` (or manually selects)
2. Clicks "Export for Hyperzod"
3. API generates Excel/CSV with columns: `Name`, `Email` in Hyperzod bulk invite format
4. File downloads in browser
5. After uploading to Hyperzod, admin clicks "Mark as Invited"
6. PATCH endpoint updates selected merchant statuses to `invited` + writes `invited_at`
7. Triggers Email #2 to each merchant

**Package:** `xlsx` or `exceljs` for Excel generation

---

### Priority 6 — Merchant Detail & Commission Management

**Status:** To do
**Route:** `src/app/admin/merchants/[id]/page.tsx`

Fields editable:
- Status (manual override)
- Assigned rep
- Commission percentage
- Notes (text area, append-style log)
- Readiness checklist (checkboxes)

Activity timeline showing all status changes with timestamps.

---

### Priority 7 — Follow-Up Task System

**Status:** To do
**Implementation:** Supabase cron job (pg_cron) or Vercel cron

Rules:
- If merchant status = `pending` and `created_at` > 48hrs → send internal alert to assigned rep
- If merchant status = `invited` and `invited_at` > 72hrs → send merchant chase email
- If merchant status = `contacted` and `contacted_at` > 5 days with no status change → escalation alert

---

### Priority 8 — Approve & Publish

**Status:** To do
**Route:** `src/app/api/admin/merchants/[id]/publish/route.ts`

Logic:
1. Validate readiness checklist (all 4 checks must be true)
2. If not complete → return error with missing items
3. If complete:
   - PATCH Hyperzod: update merchant status `0 → 1`
   - UPDATE Supabase: `status = live`, `activated_at = now()`
   - Send Email #4 to merchant
   - Return success

---

## Phase 2 — Deferred Features

> These become valuable only after merchant volume exists and Phase 1 operations are stable.

| Feature | Why Deferred |
|---|---|
| Google Business Enrichment | API costs, lower launch ROI |
| Instagram Analysis | Meta API complexity, rate limits |
| AI Lead Scoring | Requires historical data |
| Call Recording + AI Notes | Needs Twilio Voice infrastructure |
| Demo Booking (Calendly) | Only needed at volume with multiple reps |
| E-Signatures & OCR Documents | High complexity, low early ROI |
| Menu OCR Import | Hyperzod handles menu infrastructure |
| Image Enhancement AI | Luxury feature, not operationally critical |
| Menu QA Automation | Needs scale to justify |
| POS Detection & Integrations | Hyperzod owns ordering stack |
| Merchant Training System | Needs content creation first |
| Marketing Blast Automation | Only valuable when user base grows |
| Post-Launch Monitoring | Needs operational history |
| Churn Prediction | Needs order volume data |
| Re-engagement Campaigns | Scale-stage intelligence |

---

## Unified Admin Panel Architecture

All data already exists in Supabase. The admin panel is the operational layer over the entire HalalMe ecosystem.

```
/admin
├── /merchants          Merchant CRM pipeline (Phase 1 Priority)
│   ├── Pipeline table (all statuses)
│   ├── Export for Hyperzod
│   ├── Mark as Invited (batch)
│   └── /[id]  Merchant detail, commission, notes, publish
│
├── /users              User Management
│   ├── All signups
│   ├── Verification status
│   ├── Hyperzod provisioning status
│   ├── Role management (user / admin)
│   └── Ban / moderation actions
│
├── /kitchen            Kitchen Module
│   ├── Recipe moderation
│   ├── AI usage logs
│   └── Featured content management
│
├── /hub                Hub / Community Module
│   ├── Post moderation
│   ├── Reported content queue
│   └── Community oversight
│
├── /rewards            Rewards System
│   ├── Rewards ledger
│   ├── Charity pot tracking
│   └── Redemption history
│
└── /analytics          Analytics (Phase 1 basic)
    ├── Merchant pipeline funnel
    ├── Onboarding performance (avg days per stage)
    ├── User signups over time
    └── Orders overview (from Hyperzod)
```

---

## Database Schema

### Current `merchants` table (after migrations 028 + 029)

```sql
merchants
├── id                    UUID PK
├── hyperzod_merchant_id  TEXT
├── hyperzod_sync_failed  BOOLEAN (default false)
├── name                  TEXT NOT NULL
├── owner_name            TEXT
├── email                 TEXT NOT NULL UNIQUE
├── phone                 TEXT NOT NULL
├── address               TEXT
├── city                  TEXT
├── state                 TEXT
├── post_code             TEXT
├── country               TEXT (default 'United Kingdom')
├── country_code          TEXT (default 'GB')
├── category_ids          TEXT[]
├── order_types           TEXT[]
├── status                TEXT (default 'pending')
├── notes                 TEXT
├── commission_percentage NUMERIC(5,2)
├── commission_fixed      NUMERIC(10,2)
├── contacted_at          TIMESTAMPTZ   ← exists but never written
├── invited_at            TIMESTAMPTZ   ← exists but never written
├── activated_at          TIMESTAMPTZ   ← exists but never written
├── website               TEXT
├── created_at            TIMESTAMPTZ
└── updated_at            TIMESTAMPTZ (auto-managed)
```

### Next migration needed — `030_merchant_crm.sql`

```sql
ALTER TABLE public.merchants
  ADD COLUMN IF NOT EXISTS source_attribution    TEXT,
  ADD COLUMN IF NOT EXISTS assigned_rep          TEXT,
  ADD COLUMN IF NOT EXISTS readiness_checklist   JSONB DEFAULT '{
    "invite_accepted": false,
    "commission_agreed": false,
    "notes_completed": false,
    "onboarding_verified": false
  }'::jsonb;

-- Update status to be explicit (existing 'pending' default is fine)
-- Valid values: pending | invited | contacted | negotiating | agreed | live | rejected
-- Enforced at application layer, not DB constraint, for flexibility
```

---

## Technical Build Order

```
Week 1
──────
[ ] Migration 030 — merchant CRM columns
[ ] Resend wired up — emailService.ts
[ ] 4 email templates created (React Email)
[ ] Email #1 triggered on merchant registration

Week 2
──────
[ ] Admin panel shell — /admin layout, role gate, sidebar
[ ] Merchant pipeline table — all statuses, filter, search
[ ] Merchant detail page — commission, notes, status update

Week 3
──────
[ ] Hyperzod export — Excel generation, download
[ ] Mark as Invited batch action — status update + Email #2
[ ] Readiness checklist UI in merchant detail
[ ] Agreement status → triggers Email #3

Week 4
──────
[ ] Approve & Publish — Hyperzod status flip + Email #4
[ ] Follow-up cron jobs — rep reminders, merchant chasers
[ ] User management module in admin panel
[ ] Basic analytics — pipeline funnel

Post-Launch (Phase 1 completion)
─────────────────────────────────
[ ] Kitchen moderation module
[ ] Hub moderation module
[ ] Rewards management module
[ ] Webhook HMAC verification (security fix)
```

---

## Operational SLA Requirements

Technology alone will not solve onboarding. Operational discipline is mandatory.

| Standard | Requirement |
|---|---|
| First contact | Every merchant contacted within 24hrs of registration |
| Invite batch | Every invite sent within 24hrs of registration |
| Onboarding review | Every merchant reviewed by agent before activation |
| Status hygiene | Every merchant status updated same day as action taken |

**This is the difference between scalable onboarding and operational chaos.**

---

## Key Decisions Log

| Decision | Rationale |
|---|---|
| Use Resend for email | Native Next.js SDK, React Email templates, 3k free/month |
| Hyperzod bulk Excel (not API) | Hyperzod has no public invitation API — confirmed with their support |
| Merchant status = 0 during setup | Merchant has dashboard access but is invisible on HalalMe until explicit activation |
| Readiness checklist gates publish | Prevents incomplete or unapproved merchants going live |
| Phase 1 = no AI | Not the bottleneck at launch; data doesn't exist yet for scoring |
| One unified admin panel | All data is already in Supabase — no separate CRM tool needed |
| Do not replace Hyperzod in Phase 1 | Hyperzod owns menu/ordering/delivery — HalalMe owns acquisition/CRM/activation |

---

*Last updated: 2026-06-02*
*Status: Phase 1 planning complete — ready to build*
