# HalalMe — Operations Workspaces & Support Escalation Plan

> **Status: PARKED.** This captures the founder's two recommendation docs
> (Operations Workspaces + Support Escalation / Delivery Visibility). We finish
> the current admin build first (the domain modules — see `ADMIN_PANEL_PLAN_SUMMARY.md`,
> Days 1–6), **then** revisit this plan. Nothing here is started yet.
>
> **Core principle (from the founder):** one data model, multiple operational
> views. Build the *domain modules* once as the single source of truth; layer
> role-specific *workspaces* on top as filtered views — never duplicate data.

---

## The Two Layers

- **Layer 1 — Domain Modules** = the data (single source of truth). *This is what we're building now.*
- **Layer 2 — Operational Workspaces** = team-specific dashboards that re-slice Layer 1 data. *Phase 2.*

| Layer 1 — Domain Modules | Where it lives in our build |
|---|---|
| Overview | Day 6 (dashboard) |
| Merchants | ✅ Built (Days 1–3 work) |
| Users | ✅ Built (Day 2) |
| Rewards & Charity | Day 3 |
| Kitchen | Day 4 |
| Hub | Day 4 |
| Support | Day 5 |
| Analytics | Day 6 |

> The founder's Layer 1 list matches our current plan 1:1. No change to scope.

---

## PHASE 1 — Current build (domain modules)

These are the foundations. Most already exist or are scheduled in Days 1–6.

### Already built
- Roles & permissions engine (`super_admin` / `admin` + per-module `none/view/manage`)
- Merchants module (pipeline, commission, documents, assigned-rep, "My Merchants")
- Users module (list, detail, suspend/ban, verify, edit, delete, bulk)
- Permission enforcement across all admin routes + sidebar filtering

### Scheduled (Days 3–6)
- Rewards & Charity admin (applications, directory, donations, fraud queue, reward rules)
- Kitchen moderation (recipes, halal-verify, featured, AI usage)
- Hub moderation (posts, comments, community oversight)
- Support ticketing (inbox, ticket types, email notifications) — **see Support section below**
- Analytics (funnel, growth, donations, kitchen, hub)
- Overview dashboard (cross-module KPIs + "needs attention" feed)

### Phase 1 sidebar grouping (cheap, optional now)
Reorganize the menu into sections so the structure is ready for Phase 2 workspaces:

```
Overview

DOMAINS
  Merchants
  Users
  Rewards & Charity
  Kitchen
  Hub
  Support

INTELLIGENCE
  Analytics

SYSTEM
  Permissions   ← already built (lives in Users today)
  Audit         ← Phase 2
  Settings      ← Phase 2
```

The `OPERATIONS` group (Sales / Customer Services / Accounts / Marketing) is added in Phase 2.

---

## PHASE 2 — Operational Workspaces (deferred)

Role-specific dashboards. Each is a **view that reuses existing domain data** — minimal new backend. Legend: ✅ data already exists · 🆕 small new piece · 🟡 larger new build.

### Sales Workspace
For the sales/onboarding team.
- Merchant Pipeline — ✅ Merchants module
- Assigned Merchants — ✅ "My Merchants" scoping
- Commission Tracking — ✅ commission system
- Follow-Ups — ✅ `getFollowUp`
- Tasks Due — 🆕 simple task list
- Activation Queue — ✅ derived from pipeline (ready-to-go-live)
- Conversion Metrics — 🆕 analytics query (stage→stage %)

### Customer Services Workspace
For the support team.
- Open Tickets — ✅ Support module
- Delivery Escalations — 🆕 ticket type + Evermile deep link (see Support section)
- Merchant Support / User Support — ✅ Support module (already splits by source)
- Response SLA — 🆕 SLA timer field on tickets
- Call Outcomes — 🟡 Phase 2 (manual-call logging, see Support section)
- Knowledge Base — 🟡 canned answers / help articles
- *Future:* Evermile delivery lookup, call logs, AI summaries

### Accounts Workspace
For finance.
- Merchant Billing — 🟡 mostly new
- Commission Ledger — ✅ commission data exists
- Payout Status — 🟡 Stripe Connect (partial)
- Charity Ledger — ✅ donations data
- Refund Queue — ✅ exists in donations/fraud flow
- Invoice Management — 🟡 new

### Marketing Workspace
For growth. (Least-built area — all Phase 2.)
- Campaigns · Referral Performance · Reward Activation · SEO Content
- Kitchen Growth · Community Growth · Email Performance

### Analytics Workspace (Intelligence)
This **is** the Day 6 Analytics module — reporting over existing data.
- Merchant Funnel · User Growth · Retention · Rewards · Support Performance · Operational Health

### System
- **Permissions** — ✅ already built (promote in nav to its own item)
- **Audit** — 🟡 shared `admin_audit_log` (deferred in `USER_MANAGEMENT.md` Phase 2)
- **Settings** — 🟡 platform config (emails, reward rules, thresholds)

---

## Support Escalation & Delivery Visibility (founder Doc 2)

Guidance for the **Support module (Day 5)**. Key message: keep Phase 1 simple;
**do not** build telephony or the Evermile API yet. Treat telephony and delivery
visibility as two *separate* capabilities.

### Capability 1 — Escalation & Support Operations
Phase 1 is what we already specced: inbox + email + ticket. Add lightweight hooks:
- **Phase 1 (now/Day 5):** support inbox, email replies, manual outbound calls, basic call-outcome logging.
- **Phase 1.5:** click-to-call, inbound routing, basic logging.
- **Phase 2:** full telephony — recording, transcription, QA, analytics.
  - ⚠️ Once recording exists: consent, retention, storage, summaries, permissions, and compliance all become architectural concerns. **Defer deliberately.**

**Support call telemetry** (fields to capture once call logging exists — mostly Phase 1.5/2):
`call_created_at`, `queue_wait_time`, `time_to_answer`, `call_duration`,
`resolution_status`, `first_contact_resolution`, `escalation_reason`, `agent_id`,
`merchant_or_user`, `call_summary`, `sentiment` (optional later), `follow_up_required`.

### Capability 2 — Delivery Visibility Layer
- **Phase 1 (now/Day 5):** Support ticket → has a **delivery reference** → **"Open in Evermile" deep link** → agent views status externally → responds. *(One nullable field + a link. Trivial.)*
- **Phase 2:** Support → fetch Evermile API → delivery timeline → driver location → auto-response.

### Strategic line (founder's words)
> Add support escalation **hooks** now. Do **not** build telephony infrastructure yet.
> Phase 1 = operational clarity. Phase 2 = intelligence.

---

## What this means for the current build

**Near-term additions to fold in (small):**
1. *(Optional now)* Regroup the sidebar into Domains / Intelligence / System sections.
2. *(Day 5, when building Support)* Add a nullable `delivery_reference` field + "Open in Evermile" link; optionally a few call-outcome fields.

**Everything else is Phase 2** and reuses Phase 1 data:
- All four Operations Workspaces (Sales, Customer Services, Accounts, Marketing)
- Audit log, Settings
- Telephony (recording/transcription/QA), Evermile API integration
- Marketing/growth tooling, invoicing/billing/payouts

---

## Decision

Finish the domain modules (Days 1–6) first. Once those are live and stable, revisit
this doc to build the Operations Workspaces as views over the completed data model —
exactly as the founder recommended: **single-source data, multiple operational views.**
