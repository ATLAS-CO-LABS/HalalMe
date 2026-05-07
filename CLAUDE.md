# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (Next.js)
npm run build    # Build for production
npm run lint     # Run ESLint
```

No test suite is configured. There is no `npm test` command.

### Supabase

```bash
supabase start           # Start local Supabase (Docker required)
supabase db push         # Push migrations to remote
supabase gen types typescript --project-id <id> > src/types/index.ts
```

## Architecture Overview

HalalMe is a **Next.js 15 App Router** halal lifestyle platform with seven service pillars: Kitchen (AI recipes), Hub (social feed), Fresh (meal subscriptions), Delivery, Rewards (charity donations), Travel, and Marketplace.

**Stack:** Next.js 15, React 19, TypeScript 5, Tailwind CSS 4, Supabase (Postgres + Auth + Realtime + Storage), Stripe, Cloudinary, Framer Motion, GSAP.

### Folder Structure

```
src/
├── app/              # Next.js App Router — all pages are client components ("use client")
│   ├── (auth)/       # login, signup, verify-otp, reset-password
│   ├── kitchen/      # Recipe browsing, AI chat, detail
│   ├── hub/          # Social feed, post detail, user profiles
│   ├── fresh/        # Meal delivery subscription
│   ├── rewards/      # Loyalty program, charity donations
│   ├── travel/       # Flight/hotel/car search, city guides
│   └── api/          # API route handlers
├── services/         # All Supabase queries and business logic
├── context/          # AuthContext, CartContext, AuthGateContext, AppResumeContext
├── hooks/            # useAuth, useAuthGate, useAppResume
├── lib/              # Utilities: appLifecycle, supabase-server, withTimeout, minDelay
├── components/       # UI components grouped by domain
├── types/            # app.ts (hand-written types), index.ts (Supabase-generated)
└── data/             # Static mock data for features not yet backed by DB
supabase/
├── migrations/       # SQL migration files (numbered sequentially)
└── functions/        # Deno Edge Functions (stripe webhooks)
```

### Supabase Client Pattern

Two clients are exported from `src/services/supabase.ts`:

- **`supabase`** — authenticated browser client via `@supabase/auth-helpers-nextjs`. Use for all mutations and user-specific reads.
- **`supabasePublic`** — unauthenticated read-only client (`persistSession: false`, `autoRefreshToken: false`). Use for public SELECT queries to avoid token refresh blocking the request.

For server-side route handlers, use `src/lib/supabase-server.ts` (creates a server client with cookies).

### Auth Flow

1. `AuthContext` (`src/context/AuthContext.tsx`) is the single source of truth for user state.
2. `authService.ts` wraps all Supabase auth calls. OTP is used for both email verification on signup and password reset.
3. Protected actions (like, comment, follow) use `AuthGateContext` — calling `useAuthGate().requireAuth()` opens a login modal instead of redirecting.
4. Routes under `src/app/(protected)/` require authentication at the layout level.

### Data Loading Pattern

All pages are `"use client"` components. Data is fetched in `useEffect` → `setState`. Use skeleton screens during loading. The `minDelay(promise, ms)` utility (default 400ms) prevents loading flash.

### App Lifecycle / Realtime

`AppResumeContext` + `src/lib/appLifecycle.ts` handle BFCache, tab visibility, and network reconnects. If the tab is hidden for >5 seconds, Supabase Realtime is force-disconnected and reconnected on resume. This prevents stale socket state after tab switches.

### Key Conventions

- **Path alias**: `@/*` maps to `./src/*`
- **Brand colors**: Forest green `#102C26`, Champagne `#F7E7CE`, Magenta `#F03E9E`
- **Component variants**: Use `class-variance-authority` (CVA) for multi-variant components
- **Fire-and-forget mutations** (e.g., view count): `.then(() => {})` — do not await
- **Error types**: Services throw plain `Error`. AI operations throw `AIRequestError` (has `.code`). Rate limit detection via `isRateLimitError()` in authService.
- **Pagination**: `supabase.from(...).range(from, to)` with `{ count: "exact" }` for total count

### Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
```
Stripe keys are needed for rewards/checkout features.
