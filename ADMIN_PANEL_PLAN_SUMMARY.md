# HalalMe Admin Panel — Plan Summary (for Founder Review)

This document explains, in plain language, what we're about to build for the admin panel,
why we're building it, and the order we'll build it in. It summarizes three detailed
technical specs (`USER_MANAGEMENT.md`, `ADMIN_CONTENT_REWARDS.md`,
`ADMIN_OVERVIEW_ANALYTICS_CHAT.md`) — those contain the full technical detail for
implementation; this doc is the "what and why" for review.

---

## 1. The Big Picture

Right now the admin panel only really has a "Merchants" section. Everything else —
managing users, moderating recipes/posts, running the charity program, seeing overall
business numbers, and replying to customer support messages — either doesn't exist yet
or has no proper screen.

This plan adds **6 new sections** to the admin panel and a proper **team roles & permissions
system**, so we can safely bring on team members without giving everyone full access to
everything.

---

## 2. Team Roles & Permissions (the foundation)

Today, "admin" is all-or-nothing — anyone marked as admin can do anything in the panel.
That's risky once we have more than 1-2 people.

**New setup:**

- **Super Admins** — that's the two of us (`halalme.ops@gmail.com` and
  `muazamkhan203@gmail.com`). Full access to everything, always. Only super admins can
  promote someone to "admin" or change what they're allowed to access.
- **Admins (team members)** — access is controlled per section. For each of the 6 modules
  below, a team member can have: **No Access**, **View Only**, or **Full Access (view + make changes)**.
  - Example: a customer support hire could get "Full Access" to Support Chat and Users,
    but "No Access" to Rewards/Charity finances.
- The sidebar automatically hides sections a team member isn't allowed to see.
- Safety rule: nobody can edit their own role or permissions — only a *different* super
  admin can change someone's access. And super admin status can never be changed from the
  app itself (only directly by us), so no one can accidentally lock us out or grant
  themselves super admin.

---

## 3. New Admin Sections

### A. Users (`/admin/users`)
A searchable list of every signed-up user — name, email, role, account status, reward
points, join date, and whether they're linked to a merchant account.

Click into a user to:
- See their full profile.
- **Suspend or ban** an account (with a required reason — useful for abuse/spam).
- (Super admins only) Promote a user to "Admin" and set their section-by-section permissions.

### B. Merchant "Assigned Rep" — Fix
Currently, each merchant has a free-text "assigned rep" field — it's just typed text,
not connected to an actual team account. We're upgrading this to a real dropdown of
team members, so:
- Reports/filters actually work ("show me only my merchants").
- A rep with "View Only" access to Merchants automatically only sees the merchants
  assigned to them — they can't browse everyone else's accounts.

### C. Rewards / Charity (`/admin/rewards`)
This is the home for managing the charity donation program (the database for this is
already built — this is just the screens to manage it). Five tabs:

1. **Charity Applications** — review applications from charities wanting to join, approve
   or reject them, with notes.
2. **Charity Directory** — manage the list of charities people can donate to (edit goals,
   feature charities, suspend ones that are problematic).
3. **Donations Ledger** — a searchable log of every donation made.
4. **Fraud Queue** — flagged/suspicious donations that need a human look before rewards
   are released or a refund is issued.
5. **Reward Rules** — control how many points users earn for different actions.

### D. Kitchen Moderation (`/admin/kitchen`)
A moderation table for recipes (both AI-generated and user-submitted):
- Hide/unpublish a recipe without deleting it.
- Mark a recipe as "Halal Verified" (our own certification badge).
- Feature a recipe on the Kitchen homepage.
- Delete recipes that violate guidelines.
- A small stats panel showing AI recipe-generation usage (helps us spot abuse or plan
  capacity).

### E. Hub Moderation (`/admin/hub`)
Same idea, for the social feed:
- Hide or delete posts and comments that break community guidelines.
- A small "community health" stats panel (top posters, daily activity, etc.)

*(Note: we're not adding a user-facing "report" button yet — admins will browse and
moderate directly. A report queue is a Phase 2 idea if the community grows.)*

### F. Overview Dashboard (`/admin`)
Right now, opening the admin panel just dumps you into the Merchants page. We're
replacing that with a real home screen showing, at a glance:
- Total users, new signups this week
- Merchant pipeline status + how many need attention
- Recipes pending halal verification
- Charity totals raised + pending applications
- Open support tickets
- Pending fraud flags

Plus a combined "Needs Attention" list and a "Recent Activity" feed — so whoever opens
the panel each morning immediately sees what needs action, without digging through
every section.

### G. Analytics (`/admin/analytics`)
Read-only reporting dashboards, pulling from data we already collect:
- Merchant pipeline funnel (how merchants move through onboarding stages, and where they
  get stuck)
- User growth over time
- Donations/rewards trends, top charities
- Recipe activity (published over time, AI vs. user-made, most viewed)
- Hub engagement (posts, likes/comments, most-followed users)

We'll build simple charts ourselves first (no new software cost); if we later want
fancier interactive charts, that's a small add-on.

### H. Support Chat / Help Desk (`/admin/chat`)
A proper "inbox" for customer support — like a lightweight version of Intercom/Zendesk:

- **Logged-in users and merchants** can open a support conversation from inside the app
  ("Contact Support").
- Each conversation shows up in an **admin inbox**, with status (open / waiting on us /
  resolved / closed), priority, and who on the team is handling it.
- Admins reply directly from the inbox — the user gets notified by email and can reply
  back in-app.
- This is **not live chat** — it's ticket-style ("we will try to reply"), matching how
  the team currently operates. No new live-chat infrastructure needed.
- We're also fixing the **public Contact page** — right now it's a fake form that just
  shows "success" without actually sending anything. It'll now properly email the team.
- Three new email templates (matching our existing branded email designs):
  - Alert the team when a new support message comes in
  - Notify the user/merchant when we reply
  - Notify the team when someone submits the public contact form

---

## 4. Suggested Build Order (roughly 1 week)

1. **Day 1 — Foundation**: Set up the new roles/permissions system, fix the
   merchant "assigned rep" field, and update the 12 existing admin pages so they
   recognize the new "Super Admin" role correctly (otherwise we'd lock ourselves out).
2. **Day 2 — Users section**: Build the Users list + profile pages, including
   suspend/ban and the permissions screen.
3. **Day 3 — Rewards/Charity**: Build all 5 tabs (applications, directory, donations,
   fraud queue, reward rules) — database already exists, so this is mostly screens.
4. **Day 4 — Kitchen & Hub moderation**: Build both moderation tables/screens.
5. **Day 5 — Support Chat**: Build the ticket system — database, in-app messaging for
   users/merchants, admin inbox, and email notifications. Fix the public contact form.
6. **Day 6 — Analytics**: Build the reporting dashboards (funnel, growth, donations,
   recipes, hub engagement).
7. **Day 7 — Overview Dashboard**: Build the new home screen last, since it pulls
   numbers from every section built in the days before.

---

## 5. What We're Deliberately NOT Doing Yet (Phase 2)

To keep this focused and shippable in about a week, we're intentionally deferring:

- A user-facing "Report this" button on posts/recipes/comments (admins moderate directly
  for now).
- Live/real-time chat for support (ticket + email works for our current response model).
- File attachments in support messages.
- Canned responses / support macros.
- Automatic verification of charities via external government databases (manual review
  for now).
- A single shared "activity log" across all admin actions (each section keeps its own
  notes for now).

None of these block launch — they're improvements we can add once we have more team
members or higher volume.

---

## 6. Bottom Line

This gives us: a safe way to add team members with limited access, full visibility into
users/merchants/recipes/posts/donations, a proper customer support inbox, and a
dashboard that tells us what needs attention every morning — built on our existing
database with minimal new infrastructure (no new paid tools required).

**We're ready to start as soon as we get the go-ahead.**
