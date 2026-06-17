# HalalMe Admin Panel — Rewards, Kitchen & Hub Modules

> Builds on `MERCHANT_CRM.md` and `USER_MANAGEMENT.md`. Covers the next three
> sidebar modules: `/admin/rewards` (charity system), `/admin/kitchen`,
> `/admin/hub`. Permission keys (`rewards`, `kitchen`, `hub`) already exist
> in the `admin_permissions` model from `USER_MANAGEMENT.md`.

---

## Table of Contents

1. [Build Order](#build-order)
2. [Rewards / Charity Module](#rewards--charity-module)
3. [Kitchen Module](#kitchen-module)
4. [Hub Module](#hub-module)
5. [Database Migrations](#database-migrations)
6. [Phase 2 — Deferred](#phase-2--deferred)

---

## Build Order

1. **Rewards** first — schema is already complete (`005_rewards.sql`, `017_charity_verification.sql`, `020_fraud_system.sql`). Pure admin UI + API, no new tables needed.
2. **Kitchen** — one small migration (`is_featured`), then moderation table + featured toggle.
3. **Hub** — moderation table (posts + comments), no schema changes needed.

Both Kitchen and Hub use **direct admin browse/unpublish/delete** — no user-facing "report" feature in this phase (Phase 2, see below).

---

## Rewards / Charity Module

`/admin/rewards` — tabbed interface (mirrors the merchant pipeline page's stat-card + table pattern).

### Tab 1 — Charity Applications (`charity_applications`)

- Queue of `pending` / `under_review` applications.
- Detail view: applicant info, proposed charity details, uploaded documents (signed URLs from `charity-documents` bucket), `external_check_status`.
- Actions:
  - **Approve** → creates a `charities` row from the application fields, sets `verification_status='approved'`, `is_active=true`, `verification_level` per admin's review (1 or 2), writes `charity_verification_log` entry, sets `charity_applications.charity_id` + `status='approved'`.
  - **Reject** → `status='rejected'` + `reviewer_notes` (required).
  - **Request more info** → `status='under_review'` + note (no charity created yet).

### Tab 2 — Charity Directory (`charities`)

- Table: name, category, verification level/score badge, goal vs raised, donor count, featured flag, active/suspended status.
- Edit: goal_amount, minimum_donation, platform_fee_pct, is_featured, is_zakat_eligible, description/long_description, image.
- Suspend/reinstate → updates `verification_status` + `is_active`, writes `charity_verification_log` (`change_type: 'suspended'`/`'reinstated'`).
- "Add charity" — admin can create a charity directly (skip application flow) for seeding initial directory.

### Tab 3 — Donations Ledger (`donations`)

- Searchable/filterable table: user, charity, amount, status, points_earned, created_at.
- Read-only (status transitions are webhook/service-role only per existing RLS) — except refund initiation, which already exists via Stripe (`mcp__stripe__create_refund` / existing refund flow if any).

### Tab 4 — Fraud Queue (`donation_flags`)

- `pending_review` flags: donation details, `signal_breakdown` (which risk rules fired), risk score.
- Actions: **Reviewed Safe** (`status='reviewed_safe'`, releases rewards — insert `reward_transactions` row if not already present) / **Reviewed Blocked** (`status='reviewed_blocked'`, triggers Stripe refund).
- Writes `reviewed_by`, `reviewed_at`, `reviewer_notes`.

### Tab 5 — Reward Rules (`reward_rules`)

- Simple editable table: action, label, points_per_unit, unit, max_per_day, max_lifetime, is_active, valid_until.
- Inline edit, no new schema.

### API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/admin/charity-applications` | GET | List, filter by status |
| `/api/admin/charity-applications/[id]` | GET, PATCH | Detail, approve/reject/request-info |
| `/api/admin/charities` | GET, POST | Directory list, create charity directly |
| `/api/admin/charities/[id]` | PATCH | Edit/feature/suspend |
| `/api/admin/donations` | GET | Ledger, paginated/filterable |
| `/api/admin/donation-flags` | GET | Fraud queue |
| `/api/admin/donation-flags/[id]` | PATCH | Review safe/blocked |
| `/api/admin/reward-rules` | GET, PATCH | List + edit rules |

All gated by `rewards:view` (GET) / `rewards:manage` (mutations) per `USER_MANAGEMENT.md`'s permission pattern.

---

## Kitchen Module

`/admin/kitchen`

### Recipe Moderation Table

- Columns: title, author (`profiles.full_name`), cuisine, difficulty, published/unpublished, halal-verified badge, AI-generated badge, featured, rating/review count, view count, created date.
- Filters: published status, halal-verified, AI-generated vs user-submitted, search by title/author.
- Actions:
  - Toggle `is_published` (unpublish a recipe — hides from public without deleting).
  - Toggle `is_halal_verified` (admin manually certifies halal status).
  - Toggle `is_featured` (new column — shows on Kitchen homepage "Featured" section).
  - Delete (hard delete — cascades to `recipe_reviews`, `recipe_favorites`).

### AI Usage Panel

- From `ai_chat_sessions` (count of sessions, sessions → recipe conversion rate) and `ai_request_counts` (hourly request volume per user — useful for spotting abuse/rate-limit tuning).
- Read-only stats, no actions in Phase 1.

### API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/admin/recipes` | GET | Paginated/filterable list |
| `/api/admin/recipes/[id]` | PATCH | Toggle published/halal-verified/featured |
| `/api/admin/recipes/[id]` | DELETE | Hard delete |
| `/api/admin/kitchen/ai-usage` | GET | Aggregate stats from `ai_chat_sessions`/`ai_request_counts` |

Gated by `kitchen:view` / `kitchen:manage`.

---

## Hub Module

`/admin/hub`

### Posts Moderation Table

- Columns: author, content preview, post_type, media indicator, like/comment/view counts, published status, created date.
- Filters: post_type, published status, search by content/author.
- Actions: toggle `is_published` (unpublish), delete (cascades to comments/likes/bookmarks/notifications).

### Comments Moderation

- Secondary table/tab: comment content, author, parent post link, like_count, created date.
- Action: delete (cascades to replies via `parent_id` FK `ON DELETE CASCADE`).

### Community Oversight (read-only stats)

- Top posters, follow graph size, daily post volume — small stat-card row, similar to merchant pipeline's "Recent Activity"/"Top Cities" rail.

### API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/admin/hub/posts` | GET | Paginated/filterable list |
| `/api/admin/hub/posts/[id]` | PATCH, DELETE | Unpublish / delete |
| `/api/admin/hub/comments` | GET | Paginated list |
| `/api/admin/hub/comments/[id]` | DELETE | Delete comment (+ replies) |

Gated by `hub:view` / `hub:manage`.

---

## Database Migrations

### `038_kitchen_featured.sql`

```sql
alter table public.recipes add column if not exists is_featured boolean not null default false;
create index if not exists idx_recipes_is_featured on public.recipes(is_featured) where is_featured = true;
```

No other schema changes required — Rewards and Hub modules use existing tables as-is.

---

## Phase 2 — Deferred

| Feature | Why Deferred |
|---|---|
| User-facing "Report" button (posts/comments/recipes) + `reports` table + admin triage queue | Direct admin browse covers moderation needs at current volume; revisit once community size grows |
| Charity Commission / Companies House external verification API calls | `external_check_status`/`external_api_response` fields exist but no API integration yet — admin uses manual verification (level 1/2) for now |
| Pinned posts / Hub homepage curation | Not requested; `is_featured` only added for Kitchen this phase |
| Bulk recipe import / AI content review workflows | Needs scale to justify |
