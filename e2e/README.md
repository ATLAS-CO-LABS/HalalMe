# E2E tests (Playwright)

Critical-flow tests: auth, donation checkout, Hub posting. Runs against a real
deployed URL — **defaults to production (`https://halalme.co.uk`)**, not a
local server. Override with `E2E_BASE_URL` if you have a staging/preview URL.

## Before you run anything

These tests exercise the live app, not a sandbox:

- **Auth signup test** creates a real, unconfirmed `auth.users` row on every
  run (unique timestamped email). Harmless — no `profiles` row is created
  until the OTP is confirmed, and the nightly `cleanup-unconfirmed-users` cron
  (migration 040) sweeps anything left unconfirmed after 24h.
- **Hub posting test** creates a real post on the live public feed, then
  deletes it via the UI in the same test. If a run fails between creating and
  deleting, check the feed for a stray `E2E test post …` and remove it manually.
- **Checkout test** deliberately stops at the payment step — it does **not**
  submit a card and does not click the Donate button. It only confirms the
  PaymentIntent was created and the payment UI mounted.
- **Rate limiting**: login/signup routes are rate-limited. Running the auth
  suite repeatedly in a short window (e.g. re-running the whole suite a few
  times back to back) may hit that limit and fail on the rate-limit response
  rather than the actual assertion — space out reruns if you see that.

## Setup

```bash
npm install         # installs @playwright/test (already in devDependencies)
npx playwright install chromium
```

## The standing test account

Hub posting and checkout both require a logged-in user. There's no automated
way to create one (OTP confirmation needs a real inbox), so it's a one-time
manual step:

1. Sign up at `https://halalme.co.uk/signup` with an email you control (a
   Gmail `+e2etest` alias works well) and complete the OTP.
2. Set the credentials as env vars before running the suite:

```bash
# .env.e2e (not committed — .env* is gitignored)
E2E_USER_EMAIL=you+e2etest@gmail.com
E2E_USER_PASSWORD=your-password
```

Specs that need login (`e2e/hub.spec.ts`, `e2e/checkout.spec.ts`, and one test
in `e2e/auth.spec.ts`) skip themselves automatically when these aren't set —
the rest of the auth suite (login validation, signup validation, signup →
OTP redirect) runs without any credentials.

## Running

```bash
npx playwright test                       # headless, all specs
npx playwright test e2e/auth.spec.ts       # one file
npx playwright test --ui                   # interactive UI mode
npx playwright show-report                 # view the last HTML report
```
