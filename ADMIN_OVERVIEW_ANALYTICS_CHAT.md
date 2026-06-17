# HalalMe Admin Panel — Overview, Analytics & Support Chat

> Builds on `MERCHANT_CRM.md`, `USER_MANAGEMENT.md`, `ADMIN_CONTENT_REWARDS.md`.
> Final three sidebar modules: `/admin` (Overview/dashboard home),
> `/admin/analytics`, and the new support ticketing system
> (`/admin/chat` + user/merchant-facing "Contact Support").

---

## Table of Contents

1. [Overview Dashboard](#overview-dashboard)
2. [Analytics Module](#analytics-module)
3. [Support Chat (Ticketing) System](#support-chat-ticketing-system)
4. [Database Migrations](#database-migrations)
5. [Permission Model Update](#permission-model-update)
6. [Build Order](#build-order)
7. [Phase 2 — Deferred](#phase-2--deferred)

---

## Overview Dashboard

Currently `/admin` ([page.tsx](src/app/admin/page.tsx)) just `redirect("/admin/merchants")`. Replace with a real landing page — the first thing every admin sees.

### Content

- **Top stat row** (cross-module KPI cards, same `StatCard` component pattern as the merchant pipeline page):
  - Total users / new this week (`profiles`)
  - Total merchants by status, with "needs attention" count (`merchants` + `getFollowUp`)
  - Total recipes / pending halal-verification (`recipes`)
  - Total raised across charities / pending charity applications (`charities`, `charity_applications`)
  - Open support tickets (`support_conversations` where status in open/pending)
  - Pending fraud flags (`donation_flags` where status = pending_review)

- **"Needs Attention" feed** — a unified list combining: merchants overdue for follow-up, charity applications pending review, fraud flags pending, open support tickets unassigned. Each item links to its module.

- **Recent activity** — latest signups, latest donations, latest merchant status changes (re-uses the existing "Recent Activity" rail pattern from the merchant pipeline page, generalized across tables).

### Implementation

- `GET /api/admin/overview` — one route that runs lightweight count/aggregate queries across `profiles`, `merchants`, `recipes`, `charities`, `charity_applications`, `donation_flags`, `support_conversations`. Returns a single JSON payload for the dashboard.
- Visible to all `admin`/`super_admin` regardless of per-module permissions — but each stat card/link only appears if the viewer has at least `view` on that module (so a team member with no `kitchen` access doesn't see a "12 unverified recipes" card linking to a page they can't open).

---

## Analytics Module

`/admin/analytics` — read-only reporting, no new schema. Pulls from existing tables via aggregate SQL (service role).

### Sections

1. **Merchant Pipeline Funnel** — count of merchants at each `PIPELINE_ORDER` stage (reuses the stage list from the merchant pipeline page) with conversion % between stages, and **avg days per stage** (`invited_at - created_at`, `contacted_at - invited_at`, etc.).
2. **User Growth** — signups over time (`profiles.created_at`, grouped by week/month), role breakdown, verification rate.
3. **Rewards / Donations** — total raised over time, donations by charity, average donation size, points awarded vs redeemed (`reward_transactions`), top charities by `raised_amount`.
4. **Kitchen** — recipes published over time, AI-generated vs user-submitted ratio, avg rating, most-viewed recipes, `ai_chat_sessions` volume.
5. **Hub** — posts over time, engagement (likes/comments per post), most-followed users.

### Charting

No chart library currently installed. Recommend **lightweight custom SVG components** (extending the existing `Donut` pattern from [admin/merchants/page.tsx](src/app/admin/merchants/page.tsx#L144-L173)) for simple bar/line/donut visuals — avoids a new dependency for what's mostly counts-over-time and proportions. If richer charts (zoom, tooltips) are needed later, `recharts` is the standard pick for Next.js/React 19.

### API

`GET /api/admin/analytics?section=merchants|users|rewards|kitchen|hub&range=30d|90d|all` — one route, section-scoped aggregate queries, gated by `analytics:view`.

---

## Support Chat (Ticketing) System

**Scope**: in-app support for **logged-in users and merchants only**. The public `/contact` page (currently a fake form that just shows a success message after `setTimeout` — [contact/page.tsx:85-94](src/app/contact/page.tsx#L85-L94)) is a **separate, simpler fix**: wire it to an `/api/contact` route that sends an email via the existing Resend setup (`emailService.ts`). It does not create a ticket — no schema change for that.

### Entry Points

- **Users**: a "Contact Support" action (e.g. in `/help` or profile) opens/continues a conversation with the team.
- **Merchants**: `/api/merchant/support` ([route.ts](src/app/api/merchant/support/route.ts)) currently only sends an email via `sendMerchantSupportEmail`. Extend it to **also** create a `support_conversations` row (with `merchant_id` set) + first `support_messages` row — so it shows up in the admin inbox, not just an inbox email. Keep the email as the "new ticket" notification to the team.
- **Admin**: `/admin/chat` — ticket inbox.

### Data Model

```
support_conversations
  id              uuid pk
  user_id         uuid references profiles(id)        -- the person who opened it
  merchant_id     uuid references merchants(id) null   -- set if raised via merchant dashboard
  subject         text not null
  status          text check in ('open','pending','resolved','closed') default 'open'
  -- open     = awaiting admin reply
  -- pending  = admin replied, awaiting user reply
  -- resolved = admin marked done (can be reopened by new user message)
  -- closed   = admin closed, no further replies expected
  priority        text check in ('low','normal','high') default 'normal'
  assigned_to     uuid references profiles(id) null    -- team member handling it
  last_message_at timestamptz not null default now()
  created_at, updated_at

support_messages
  id              uuid pk
  conversation_id uuid references support_conversations(id) on delete cascade
  sender_id       uuid references profiles(id)
  sender_role     text check in ('user','admin')
  body            text not null
  created_at      timestamptz not null default now()
```

- New message from user → if conversation `status='resolved'/'closed'`, reopen to `'open'`. If `status='pending'`, set to `'open'`.
- New message from admin → set `status='pending'`, `assigned_to = sender_id` if unassigned.
- A trigger keeps `support_conversations.last_message_at` in sync on `support_messages` insert (mirrors the existing `like_count`/`comment_count` sync-trigger pattern in `004_hub.sql`).

### RLS

- Users: `SELECT`/`INSERT` on their own conversations (`user_id = auth.uid()`) and messages within them.
- Admins (`role in ('admin','super_admin')`): full access — gated additionally at the API layer by the new `support` permission module (see below).

### Notifications (ticket-style, no realtime)

New email templates in `src/emails/` using the shared `theme.tsx` (matching the existing 11 Merchant* templates):

- **`SupportTicketNotifyEmail`** — sent to the support team inbox when a user/merchant opens a new conversation or sends a new message on an existing one. Subject: "New support message from {name}". Body: requester name/email, source (user/merchant), message preview, link to `/admin/chat/[id]`.
- **`SupportTicketReplyEmail`** — sent to the requester's account email when an admin replies. Subject: "You have a reply from HalalMe Support". Body: reply preview, link back into the app's support/chat view.
- **`ContactFormEmail`** — sent to the support team inbox when `/api/contact` is submitted (existing contact form, currently has no email notification — fix bundled here). Subject: "New contact form submission from {name}".

Sending: reuse a `notifyTeam`-style helper from `followUpService.ts` for the team-inbox templates; `SupportTicketReplyEmail` goes to `profiles.email` (requires `036_admin_roles.sql`'s email backfill).

### Admin UI — `/admin/chat`

- **Inbox** (list): subject, requester (user/merchant name + avatar), status badge, priority, assigned-to, last message preview + relative time. Filters: status (open/pending/resolved/closed), source (user vs merchant), assigned to me / unassigned.
- **Thread view**: message history (user messages left-aligned, admin right-aligned — standard chat layout), reply box, status dropdown, assign-to-team-member dropdown (reuses the team-member list from `USER_MANAGEMENT.md`'s rep picker — `role in ('admin','super_admin')`).

### User-facing UI

- Simple "My Messages" list + thread view, same visual language as the rest of the protected app (not the admin panel aesthetic).

### API Routes

| Route | Method | Purpose | Permission |
|---|---|---|---|
| `/api/support/conversations` | GET, POST | User: list own conversations / open a new one | auth only |
| `/api/support/conversations/[id]/messages` | GET, POST | User: read/send messages in own conversation | auth + ownership |
| `/api/admin/support/conversations` | GET | Inbox list, filterable | `support:view` |
| `/api/admin/support/conversations/[id]` | GET, PATCH | Thread + status/assign/priority | `support:view` / `support:manage` |
| `/api/admin/support/conversations/[id]/messages` | POST | Admin reply | `support:manage` |
| `/api/contact` | POST | Public contact form → email only (no ticket) | none (public) |

---

## Database Migrations

### `039_support_chat.sql`

```sql
create table if not exists public.support_conversations (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  merchant_id     uuid references public.merchants(id) on delete set null,
  subject         text not null,
  status          text not null default 'open'
                    check (status in ('open','pending','resolved','closed')),
  priority        text not null default 'normal'
                    check (priority in ('low','normal','high')),
  assigned_to     uuid references public.profiles(id) on delete set null,
  last_message_at timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.support_messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.support_conversations(id) on delete cascade,
  sender_id       uuid not null references public.profiles(id) on delete cascade,
  sender_role     text not null check (sender_role in ('user','admin')),
  body            text not null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_support_conv_user        on public.support_conversations(user_id);
create index if not exists idx_support_conv_status      on public.support_conversations(status);
create index if not exists idx_support_conv_assigned    on public.support_conversations(assigned_to);
create index if not exists idx_support_msg_conversation on public.support_messages(conversation_id);

create trigger support_conversations_updated_at
  before update on public.support_conversations
  for each row execute function update_updated_at();

-- Keep last_message_at + status in sync when a message is inserted
create or replace function sync_support_conversation_on_message()
returns trigger language plpgsql as $$
begin
  update public.support_conversations
  set last_message_at = new.created_at,
      status = case
        when new.sender_role = 'admin' then 'pending'
        else 'open'
      end,
      assigned_to = case
        when new.sender_role = 'admin' and assigned_to is null then new.sender_id
        else assigned_to
      end
  where id = new.conversation_id;
  return new;
end;
$$;

create trigger support_messages_sync
  after insert on public.support_messages
  for each row execute function sync_support_conversation_on_message();

alter table public.support_conversations enable row level security;
alter table public.support_messages enable row level security;

create policy "Users manage own conversations"
  on public.support_conversations for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Admins manage all conversations"
  on public.support_conversations for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','super_admin')))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','super_admin')));

create policy "Users read/send own messages"
  on public.support_messages for all
  using (exists (select 1 from public.support_conversations c where c.id = conversation_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.support_conversations c where c.id = conversation_id and c.user_id = auth.uid()));

create policy "Admins manage all messages"
  on public.support_messages for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','super_admin')))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','super_admin')));
```

---

## Permission Model Update

`USER_MANAGEMENT.md` defines `admin_permissions.module check in ('merchants','users','kitchen','hub','rewards','analytics')`. Add `'support'`:

```sql
alter table public.admin_permissions drop constraint if exists admin_permissions_module_check;
alter table public.admin_permissions add constraint admin_permissions_module_check
  check (module in ('merchants','users','kitchen','hub','rewards','analytics','support'));

-- Grandfather existing admins (same pattern as 036_admin_roles.sql)
insert into public.admin_permissions (user_id, module, access)
select id, 'support', 'manage' from public.profiles where role = 'admin'
on conflict (user_id, module) do nothing;
```

Sidebar gets two more entries: **Overview** (top of list, link to `/admin`, always visible to any admin/super_admin — no permission gate) and **Chat** (gated by `support`). **Analytics** (already defined as a module) becomes buildable now.

---

## Build Order

1. `039_support_chat.sql` migration + permission module update.
2. `/api/contact` — fix the public contact form (quick win, no schema).
3. Support chat: API routes + user-facing "My Messages" + merchant support integration.
4. `/admin/chat` inbox + thread view.
5. `/admin/analytics` — start with Merchant Pipeline Funnel + User Growth (data already well-understood from prior modules), then Rewards/Kitchen/Hub sections.
6. `/admin` Overview dashboard last — it aggregates from every other module, so build it once everything else (incl. analytics queries) exists to reuse.

---

## Phase 2 — Deferred

| Feature | Why Deferred |
|---|---|
| Realtime live chat (Supabase Realtime subscriptions) | Ticket-style + email notification matches "we will try to reply" async support model; revisit if response-time SLAs require live chat |
| Anonymous/guest support tickets via public /contact | Public contact form stays email-only; revisit if marketing site needs a help desk for non-members |
| File attachments in support messages | Needs Storage bucket + signed URLs, similar to `charity-documents`; add when a real need arises |
| Canned responses / macros for admin replies | Needs ticket volume to justify |
| SLA timers / auto-escalation on open tickets | Mirrors `THRESHOLDS`/follow-up cron pattern from Merchant CRM — revisit once ticket volume is real |
