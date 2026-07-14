# HalalMe User Management & Admin Roles System

> Builds on `MERCHANT_CRM.md`. This spec covers the `/admin/users` module,
> the role/permission system that governs the whole `/admin` panel, and
> linking merchant "assigned rep" to real team members.

---

## Table of Contents

1. [Current State](#current-state)
2. [Goals](#goals)
3. [Roles & Permissions Model](#roles--permissions-model)
4. [Database Schema](#database-schema)
5. [Assigned Rep → Team Members](#assigned-rep--team-members)
6. [Admin Panel Pages](#admin-panel-pages)
7. [API Routes](#api-routes)
8. [Permission Enforcement Pattern](#permission-enforcement-pattern)
9. [Build Order](#build-order)
10. [Phase 2 — Deferred](#phase-2--deferred)

---

## Current State

| Component | Status |
|---|---|
| `profiles.role` (`user` \| `admin`) | Done — but binary, no team-level granularity |
| `/admin` layout + role gate (`role === 'admin'`) | Done — `src/app/admin/layout.tsx` |
| `/admin/users` route | **Missing** — sidebar entry marked "soon" |
| `profiles.email` | **Missing** — canonical email lives only in `auth.users` |
| Ban / suspend mechanism | **Missing** — no column, no enforcement |
| `merchants.assigned_rep` | Done, but **free-text** — not linked to any account |
| Per-module admin permissions | **Missing** — every `role='admin'` user has full access to everything |
| Admin audit trail (who did what) | **Missing** — merchants only have a free-text `notes` log |

---

## Goals

Phase 1 scope:

1. `/admin/users` — searchable, paginated list of all signups with role, status, verification, reward tier.
2. `/admin/users/[id]` — profile detail, role management, suspend/ban with reason, and (super_admin only) per-module permission grid.
3. **Role tiers**: `user` / `admin` / `super_admin`. Super admins seeded: `halalme.ops@gmail.com`, `muazamkhan203@gmail.com`.
4. **`admin_permissions`** table — per-module `none` / `view` / `manage` access for `admin` users. `super_admin` always has full access (not stored, implicit).
5. Sidebar (`NAV`) and every `/api/admin/*` route respect these permissions.
6. **Assigned rep** on merchants becomes a real `profiles` reference (dropdown of team members), not free text.

---

## Roles & Permissions Model

```
profiles.role: 'user' | 'admin' | 'super_admin'
```

- **`super_admin`** — full access to all `/admin` modules. Can manage `admin_permissions` and promote/demote `user` ⇄ `admin`. NOT settable from the UI — only via direct DB migration/update, to prevent accidental self-demotion or privilege escalation via the app.
- **`admin`** — team member. Access to each module governed by `admin_permissions`. Migration grandfathers all *existing* `role='admin'` users to `manage` on every module (nothing breaks on rollout).
- **`user`** — unchanged, default for all signups.

### `admin_permissions` table

```
user_id  uuid references profiles(id) on delete cascade
module   text check in ('merchants','users','kitchen','hub','rewards','analytics')
access   text check in ('none','view','manage') default 'none'
unique (user_id, module)
```

- Only rows for `role='admin'` users are meaningful (super_admin ignores this table; regular users never have rows).
- `view` = read-only access to that module's pages/list/detail endpoints (GET).
- `manage` = `view` + can perform mutations (PATCH/POST/DELETE) in that module.
- Missing row = `none` (no access — module hidden from sidebar, API returns 403).

### Self-protection rules

- An `admin` can never view/edit their own row in `/admin/users/[id]` permission grid or role field — edits to a user's own role/permissions must come from a *different* super_admin's session. `PATCH /api/admin/users/[id]` must explicitly check `if (params.id === viewer.id) return 403` whenever `role` or permissions are part of the request body.
- `super_admin` role is immutable from the UI entirely (no button to grant/revoke it).

---

## Rollout: Fixing Existing Admin Routes for `super_admin`

**Critical — must ship in the same change as the `036` migration.** Every existing admin-gated route currently checks `profile?.role !== "admin"`, which would reject `super_admin` users the moment the migration runs:

- `src/app/admin/layout.tsx`
- `src/app/api/admin/merchants/route.ts`
- `src/app/api/admin/merchants/create/route.ts`
- `src/app/api/admin/merchants/[id]/route.ts`
- `src/app/api/admin/merchants/[id]/commission/route.ts`
- `src/app/api/admin/merchants/[id]/documents/route.ts`
- `src/app/api/admin/merchants/[id]/documents/[docId]/route.ts`
- `src/app/api/admin/merchants/[id]/info/route.ts`
- `src/app/api/admin/merchants/[id]/publish/route.ts`
- `src/app/api/admin/merchants/[id]/deactivate/route.ts`
- `src/app/api/admin/merchants/bulk/route.ts`
- `src/app/api/admin/merchants/bulk-invite/route.ts`

**Fix**: add a small shared helper (e.g. `src/lib/adminRoles.ts`):

```ts
export const STAFF_ROLES = ["admin", "super_admin"] as const;
export function isStaffRole(role: string | null | undefined) {
  return role === "admin" || role === "super_admin";
}
```

Replace every `profile?.role !== "admin"` with `!isStaffRole(profile?.role)`, and the layout's `user.role !== "admin"` with `!isStaffRole(user.role)`.

---

## Admin Self-Service: `/api/admin/me`

New lightweight route, called once by `AdminLayout` on mount (not added to `AuthContext` — admin-only concern):

```
GET /api/admin/me
→ { role: 'admin' | 'super_admin', permissions: { merchants: 'manage', users: 'none', ... } }
```

- `super_admin` → permissions object has `'manage'` for every module (not read from `admin_permissions`).
- `admin` → reads the caller's rows from `admin_permissions` (missing module = `'none'`).

`AdminLayout`'s `NAV` array filters/greys out items where `permissions[module] === 'none'`. "Overview" has no module key and is always shown to any staff role.

---

## Database Schema

### `036_admin_roles.sql`

```sql
-- Extend role enum
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('user','admin','super_admin'));

-- Email mirror (auth.users is canonical; this lets us search/filter/sort in SQL)
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists status text not null default 'active'
  check (status in ('active','suspended','banned'));
alter table public.profiles add column if not exists suspended_reason text;
alter table public.profiles add column if not exists suspended_at timestamptz;
alter table public.profiles add column if not exists suspended_by uuid references auth.users(id);

create index if not exists idx_profiles_email on public.profiles (email);
create index if not exists idx_profiles_role on public.profiles (role);
create index if not exists idx_profiles_status on public.profiles (status);

-- Backfill email from auth.users (one-time)
update public.profiles p set email = u.email
from auth.users u where u.id = p.id and p.email is null;

-- Keep email in sync going forward — replace handle_new_user() (002_auth_profiles.sql)
-- to also set email = NEW.email on INSERT.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, full_name, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      'user_' || substr(replace(NEW.id::text, '-', ''), 1, 8)
    ),
    NEW.email
  )
  ON CONFLICT (username) DO UPDATE
    SET username = 'user_' || substr(replace(NEW.id::text, '-', ''), 1, 12);
  RETURN NEW;
END;
$$;

-- Seed super admins
update public.profiles set role = 'super_admin'
where id in (select id from auth.users where email in (
  'halalme.ops@gmail.com', 'muazamkhan203@gmail.com'
));

-- Permissions table
create table if not exists public.admin_permissions (
  user_id uuid not null references public.profiles(id) on delete cascade,
  module  text not null check (module in ('merchants','users','kitchen','hub','rewards','analytics')),
  access  text not null default 'none' check (access in ('none','view','manage')),
  updated_at timestamptz not null default now(),
  primary key (user_id, module)
);

-- Grandfather existing admins to full access on all modules
insert into public.admin_permissions (user_id, module, access)
select p.id, m.module, 'manage'
from public.profiles p
cross join (values ('merchants'),('users'),('kitchen'),('hub'),('rewards'),('analytics')) as m(module)
where p.role = 'admin'
on conflict (user_id, module) do nothing;

alter table public.admin_permissions enable row level security;

create policy "Admins manage permissions"
  on public.admin_permissions for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin'));
```

### `037_merchant_rep_link.sql`

```sql
alter table public.merchants
  add column if not exists assigned_rep_id uuid references public.profiles(id) on delete set null;

create index if not exists idx_merchants_assigned_rep_id on public.merchants (assigned_rep_id);

-- Best-effort backfill: match free-text rep name to a team member's full_name
update public.merchants m
set assigned_rep_id = p.id
from public.profiles p
where p.role in ('admin','super_admin')
  and m.assigned_rep_id is null
  and m.assigned_rep is not null
  and lower(trim(p.full_name)) = lower(trim(m.assigned_rep));

-- assigned_rep (text) kept as display fallback for unmatched legacy rows
```

---

## Assigned Rep → Team Members

- Merchant pipeline page and `[id]` detail: rep picker becomes a `<select>` populated from
  `GET /api/admin/users?role=admin` (team members — `admin` + `super_admin`).
- Display: `assigned_rep_id` resolved name if set, else fall back to legacy `assigned_rep` text, else "Unassigned".
- New filter: **"My Merchants"** — `assigned_rep_id = current user's id`. Useful once `admin`s with `view`-only on `merchants` are scoped to their own book (manage-level admins still see everything).
- Bulk "Assign rep" action (`/api/admin/merchants/bulk`) updates `assigned_rep_id` (sends a `profiles.id`), not free text.

**API-level scoping** (`GET /api/admin/merchants`): after the existing role/permission check —
- `super_admin` or `merchants: 'manage'` → no extra filter, sees all merchants (current behaviour).
- `merchants: 'view'` only → query adds `.eq('assigned_rep_id', viewer.id)`. The "My Merchants" toggle in the UI is then redundant for view-only reps (it's their default and only view) but still shown for `manage`-level admins who want to filter down to their own book.

---

## Admin Panel Pages

### `/admin/users` — List

Mirrors `/admin/merchants` page structure (stat cards, filters, table/cards, search).

Columns: Avatar/initials, Name, Email, Role badge, Status badge (active/suspended/banned), Verified, Reward tier, Joined date, Linked merchant (if any).

Filters: role (`all/user/admin`), status (`all/active/suspended/banned`), search (name/email).

Stat cards: Total users, New this week, Admins/team count, Suspended/banned count.

Server-side pagination (unlike merchants page's "fetch all" — user volume will be much larger).

### `/admin/users/[id]` — Detail

- Profile info: name, email, username, phone, location, bio, joined date, verification status, reward tier/points.
- Linked merchant card (if `merchants.user_id = this user`) — link to `/admin/merchants/[merchantId]`.
- **Role**: dropdown `user ⇄ admin` (super_admin only; hidden entirely for `super_admin`-tier target users and for the viewer's own row).
- **Status**: active / suspend / ban, with required reason text — writes `status`, `suspended_reason`, `suspended_at`, `suspended_by`. Notes-style append log (mirrors merchant `notes` pattern) showing history of status changes.
- **Permissions grid** (super_admin only, only shown when target's role = `admin`): 6 modules × (none/view/manage) radio/select.

---

## API Routes

| Route | Method | Purpose | Required permission |
|---|---|---|---|
| `/api/admin/users` | GET | Paginated list, search, filter by role/status | `users:view` |
| `/api/admin/users/[id]` | GET | Single user detail + linked merchant | `users:view` |
| `/api/admin/users/[id]` | PATCH | Update role / status / permissions | `users:manage`, role/permission edits require `super_admin` |
| `/api/admin/merchants/bulk` (existing) | PATCH | extend `assign` action to accept `repId` | `merchants:manage` |

All routes follow the existing `getAdminServiceClient()` pattern (`src/app/api/admin/merchants/[id]/route.ts`), extended with a module-permission check (see below).

---

## Permission Enforcement Pattern

Extend the existing admin auth helper:

```ts
async function getAdminServiceClient(module: ModuleKey, required: 'view' | 'manage') {
  // ... existing user + profile lookup ...
  if (profile.role === 'super_admin') return { serviceClient, profile };
  if (profile.role !== 'admin') return { error: 'Forbidden', status: 403 };

  const { data: perm } = await serviceClient
    .from('admin_permissions')
    .select('access')
    .eq('user_id', user.id)
    .eq('module', module)
    .single();

  const level = perm?.access ?? 'none';
  const ok = required === 'view' ? level !== 'none' : level === 'manage';
  if (!ok) return { error: 'Forbidden', status: 403 };

  return { serviceClient, profile };
}
```

Sidebar (`src/app/admin/layout.tsx` `NAV`): on load, fetch the current admin's permission map (or include it in `useAuth`'s profile payload) and hide/grey items where `access === 'none'`. `super_admin` always sees everything (modules still marked "soon" stay hidden until built, regardless of permission).

---

## Build Order

1. `036_admin_roles.sql` + `037_merchant_rep_link.sql` migrations; extend `handle_new_user()` to set `email`.
2. `/api/admin/users` (GET list) + `/api/admin/users/[id]` (GET detail).
3. `/admin/users` list page.
4. `/admin/users/[id]` detail page — profile + status (ban/suspend) first.
5. Permission grid UI + `PATCH` role/permissions (super_admin only).
6. Wire permission checks into existing `/api/admin/merchants/*` routes + sidebar filtering.
7. Assigned rep dropdown (merchant pipeline + detail pages) using `assigned_rep_id`.
8. "My Merchants" filter.

---

## Phase 2 — Deferred

| Feature | Why Deferred |
|---|---|
| Action-level permissions (e.g. view notes but not edit commission) | none/view/manage per module is sufficient at current team size |
| Shared `admin_audit_log` table across all modules | merchant `notes`-style append log is enough for Phase 1; revisit when Kitchen/Hub moderation land |
| Reports/flagged-content queue feeding into user bans | depends on Hub/Kitchen moderation modules (also Phase 2) |
| Auth-layer ban enforcement (block login via `auth.admin.updateUserById`) | Phase 1 ban is app-level (`profiles.status`); revisit if banned users keep using the app via existing sessions |
