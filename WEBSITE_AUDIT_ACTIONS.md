# HalalMe Website Audit — Consolidated Action List

Single source of truth for the outstanding work from the August 2026 website audits.

**Merged from:**

| Source | Document | Original IDs |
| --- | --- | --- |
| Audit A | HME-WEB-AUDIT-001 (GPT, 6 Aug 2026) | P0.1–P0.8, sections 3–9, WEB-P0/P1/P2-xxx |
| Audit B | HalalMe Website Fix Plan (Viktor, 6 Aug 2026) | HM-01 to HM-27 |
| Audit C | HalalMe-Website-Fix-Plan.md | Same content as Audit B, no unique items |

Audit C is a markdown copy of Audit B, so it contributed nothing new.

**Governance note (10 Aug 2026):** Sami's response to the 7 blockers sent from this tracker arrived as `HME-WEB-DEC-001` ("Founder, Brand & Governance Decision Response", v1.0, 9 Aug 2026). It's the authoritative decision layer — this tracker stays the engineering execution register, but where the two conflict on a founder/brand/governance call, HME-WEB-DEC-001 governs. Answers folded in below: WA-01/02 (Blocker 1/2), WA-04 (Blocker 3), WA-05 (Blocker 4), WA-09 (Blocker 5), WA-10 (Blocker 6), WA-48 (Blocker 7). It also overrides three things this tracker had already shipped differently — WA-31 (Diamond locked, Platinum reverted), WA-32 (un-skipped — purple stays, brought into the governed Delivery visual system, not master green/cream), and WA-05's own "name the five cities" instruction (reversed — city names and rollout sequence are now confidential, not just pending). See the session log below for what changed in code and DB.

**How this list was built.** Every item was checked against the code on the `dev` branch before being included. Anything already shipped was dropped. See [Appendix A](#appendix-a--verified-as-already-done-excluded) for what was removed and why.

**Item IDs.** Each item has a new `WA-xx` ID. The `Source` line maps it back to the original audit IDs so you can trace it.

**Three tiers, not two.** Not everything that needs a decision needs *Sami specifically* — he's already delegated the branding/naming calls to you. Every item carries one of four tags:
- 🔴 **SERIOUS BLOCKER** — genuinely stuck without Sami: legal exposure, money, regulatory risk, or a fact only he has. This is the actual send-to-Sami list.
- 🟡 **YOUR CALL** — needs a decision, but it's yours. A recommended default is already written into the item — take it or override it, then build.
- ⛔ **WAITING** — not a fresh ask, just downstream of one of the 7 serious blockers below. Nothing to send Sami separately, it just can't start yet.
- ✅ **READY** — no decision needed at all, just build it.

---

## Order of work

1. **WA-13 first and alone.** Per-page canonicals unblock indexing across the whole site. Every other SEO item depends on it.
2. **WA-01 in parallel** by the accountant or solicitor. It is not a code task and it is the longest lead time.
3. Make the 🟡 YOUR CALL decisions today — each one takes a single read, no back-and-forth needed.
4. Work the ✅ READY list in ID order while the 🔴 SERIOUS list sits with Sami.
5. As each 🔴 item gets an answer, flip it to ✅ and pull it into the queue — that also unblocks its ⛔ WAITING dependents.

---

## Progress summary

| Priority | Items | 🔴 Serious | 🟡 Your call | ⛔ Waiting | ✅ Ready | ⏭️ Skipped | Done |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P0 — this week | 12 (WA-01 to WA-12) | 6 | 0 | 0 | 6 | 0 | 9 / 12 |
| P1 — next two weeks | 19 (WA-13 to WA-31) | 0 | 0 | 0 | 18 | 1 | 18 / 19 |
| P2 — this quarter | 25 (WA-32 to WA-56) | 1 | 2 | 2 | 20 | 0 | 10 / 25 |
| **Total** | **56** | **7** | **2** | **2** | **44** | **1** | **37 / 56** |

*10 Aug 2026, HME-WEB-DEC-001 pass: WA-05 moved to done (P0 6→7), WA-32 un-skipped into the ready queue (P2 skipped 1→0, ready 19→20). WA-01/02/04/09/10/48 stay tagged 🔴 in this table even though Sami has now answered all of them — "answered" isn't "built," and the red tag here tracks build status, not whether a decision exists.*

*11 Aug 2026, sixth pass — P2 UX work, founder-scoped to skip the bigger positioning bets (homepage, WA-38, WA-39's revert) and focus on what's concretely missing: **WA-43 done** (P2 9→10) — real point costs pulled from the catalog replaced a misleading "unlocks by tier" claim, daily-login copy reframed away from manufactured engagement, and deliberately did *not* invent a Delivery/Rewards ownership split that doesn't exist in the schema. **404 page built** (part of WA-46, done; app links/waitlist still open, not counted). **WA-51's framework built** as `HALAL_TRUST_MODEL.md` — found real per-merchant evidence data already exists (`merchant_documents`) but has no public-facing home yet, since Delivery's real listings live on Hyperzod, not this codebase (stays 🟡, not counted — public evidence page is WA-55's job). **WA-41 attempted and reverted** — tried fixing a landing-page headline ("Real Posts. Real People.") that's literally false over a stack of fabricated stock-photo personas with fake verified badges; founder asked to leave it as-is, fully reverted, flagged as a live finding rather than silently dropped. **Separately, a founder-requested fix that stuck:** Social's copy leaned on food/recipe language sitewide despite Kitchen owning recipes — reworded across `social/page.tsx`, `HorizontalServices.tsx`, `OverviewTab.tsx` and `about/page.tsx` toward community/story framing (not a WA-numbered item, tracked under WA-41's entry). **WA-40 explicitly not touched** — founder said leave it.*

*11 Aug 2026, second pass: WA-04 and WA-09 both moved to done (P0 7→9) — the language/copy rewrite is built for both, matching the same bar as WA-05. WA-02's entity constant is built and live-verified against Companies House, but the item itself stays open pending WA-01.*

*11 Aug 2026, third pass (same day): WA-02's Cookies-page gap closed. WA-42 finished and moved to done (P2 7→8) — the donation-impact block no longer invents per-amount outcomes. WA-48's retention periods drafted into the Privacy Policy — caught and fixed a real mismatch in the process (see WA-48's own section: account deletion doesn't yet anonymise community content the way the drafted policy first claimed; corrected the copy, flagged the schema work as a separate follow-up). WA-48 stays 🟡, not counted as fully done — OpenAI's training-data terms and the consent-banner conclusion still need external confirmation, not just code.*

*11 Aug 2026, fifth pass — starting the P2 UX work: **WA-44 done** (P2 8→9) — intention-based role labels, the "Operational" badge removed, plus a self-contradiction the audit never named (service grid listed 4 services directly above a "5 Unified Services" trust bar). **WA-39 attempted and reverted by founder decision** — the split was built as specified, reviewed, and judged worse than the original; see its item for the full reasoning and the revised direction (cut the repetition, keep one page). Its status is now 🔴 as a warning not to re-attempt the split, even though the underlying length/repetition problem is still genuinely open. Nothing was lost in the revert — verified the same session's earlier copy fixes to `delivery/page.tsx` all survived.*

*11 Aug 2026, fourth pass (same day) — pre-launch triage of the P2 list: went through WA-37–WA-56 and separated genuine launch-blocking risk (deceptive/unsubstantiated claims, same class as the P0 items) from growth/UX/perf work that can wait. Fixed the two that were real risk: **WA-52** — 3 live, indexed blog posts were instructing readers to go use "HalalMe Travel/Fresh/Marketplace" today, with invented specific features, for verticals that don't exist yet (the pages themselves were already correctly middleware-blocked and out of the sitemap — the blog content was the actual live exposure, not the routes). **WA-53** — two blog posts carried unverified "Dr."/"Prof." titles on health/nutrition content making specific uncited claims; `blogPosts.ts` is documented in this repo's own `CLAUDE.md` as placeholder mock data, so these credentials were never real to begin with. Removed the honorifics, added medical/dietary disclaimers to both health articles, and fixed a blanket "every vendor undergoes strict verification" claim found in the same file (a WA-04-pattern miss — it was in blog content, not a page component, so the original sweep skipped it). Both items stay 🟡 — the specific risky instances are gone, but the general systems these items describe (product-status labelling, full editorial governance) are real separate projects, not built today. WA-41's moderation/reporting piece and WA-45 (city pages) were both explicitly *not* pulled forward — the former is gated behind WA-10's legal assessment, the latter behind a "don't name cities" instruction that reverses what WA-45 assumes.*

*Recount note (8 Aug 2026, later session): the previous table undercounted P0 by one (WA-03/06/08/12 were all already checked off, four items not three) — corrected here rather than carried forward. WA-07, WA-30 and WA-35's decisions are now made (see [Sign-off](#sign-off)), so they've moved out of the 🟡 column; WA-33's brand-spelling half is decided too, its entity-name half stays 🟡 pending WA-02.*

**⏭️ Skipped (1):** WA-27 lives on `delivery.halalme.co.uk`, the separate Hyperzod white-label platform — not this codebase. Left as-is on purpose, not an oversight. Not counted toward "done," not sitting in the ready queue either. **WA-32 was skipped alongside it on 8 Aug but un-skipped 10 Aug** — HME-WEB-DEC-001 makes it a canonical override (bring the Hyperzod theme into the governed HalalMe Delivery visual system, purple retained) rather than out-of-scope. Still not built — it's a theme-settings change on the Hyperzod platform, not this codebase, but it's back in the queue.

**Session log — 7 Aug 2026:**
- Closed: WA-03, WA-06, WA-08, WA-12 (P0); WA-13 (mostly), WA-14, WA-15 (mostly), WA-16, WA-17, WA-19, WA-28, WA-47 (P1/P2 ready); WA-36 (your-call).
- **Two pages made public that were previously login-walled** — `/charity/causes` and `/hub/post/[id]` were wrapped in `AuthGuard`, invisible to Google and unshareable as links. Confirmed with you first, then verified at the RLS level (not just the UI level) that anonymous reads are actually permitted before converting. Liking/commenting/donating still require login, now via an in-page prompt instead of a redirect.
- WA-14 turned out smaller than the original audit implied in one case (`/blog/[slug]` was already fine — static data, no fetch bug) and required real verification in the other four (curled a live build against real Supabase data at every step, not just read the code and assumed).
- **Follow-up beyond WA-14's original scope, done the same session:** `/hub/feed` had the same `AuthGuard` login-wall problem — "Join HalalMe Social" / "Browse Feed" buttons were hard-redirecting to `/login`. Removed the guard there too and wired `useAuthGate` into posting, liking, bookmarking, and the Following/Saved tabs (which needed extra care — `getBookmarks` non-null-asserted the user id and would have crashed for a logged-out visitor on any entry path, not just the tab click; fixed at the data-fetching layer, not just the button). This surfaced a real, previously-latent build bug: `useSearchParams()` without a `<Suspense>` boundary, masked until now because `AuthGuard` prevented Next from attempting to statically prerender the route. Fixed by splitting the page into a thin `Suspense`-wrapped outer component and the existing content as an inner one. Not part of the original audit item, not yet reflected in the WA-14 checklist text above, but same session, same verification bar (real build, real curl tests).
- **Auth modal performance** — the sign-in/sign-up modal (triggered by `requireAuth` from Kitchen and Social pages) was reported as laggy. Root cause: `backdropFilter: blur(6px)` on the modal backdrop, which forces continuous re-compositing of everything behind it — expensive anywhere, worse on the Kitchen recipe grid and Hub feed specifically since both have a lot of images and other Framer Motion animations already running. Replaced with a plain darker overlay, no blur. Also trimmed login's artificial `minDelay` floor from 400ms to 150ms (only ever affects fast connections; slow ones were never touched by it). Left the two-sequential-network-call structure in `login`/`signup` (auth call, then a separate profile-hydration call) alone — it's structurally necessary, not an inefficiency, and touching it risks the whole app's auth flow for a marginal gain.
- Full `npm run build` + `tsc --noEmit` + `eslint` pass clean after every step. Nothing committed yet — all sitting as uncommitted changes for review.

**Session log — 8 Aug 2026:**
- Marked WA-27 and WA-32 as intentionally skipped (Hyperzod platform, out of scope by your call, not this codebase).
- Closed all 6 "Quick Wins": WA-31 (Diamond→Platinum), WA-34 (one-account contradiction), WA-21 (WCAG contrast), WA-22 (skip link + labels + tap targets), WA-23 (autocomplete), WA-26 (share image).
- **WA-21 was the one that didn't match its own audit description.** The write-up assumed 2-3 shared CSS variables; the codebase actually has three unrelated color-opacity systems across different pages (JS hex-alpha literals, CSS `color-mix()`, Tailwind `/NN` classes). Scoped the fix to exactly the 4 pages the audit's own "done when" criteria named (`/`, `/delivery`, `/for-restaurants`, `/kitchen/recipes`) rather than guessing at a sitewide token fix that doesn't exist.
- WA-26's share image: generated, then actually rendered and looked at it before shipping — first version put the logo directly on the dark background and it was nearly invisible, caught only by viewing the output, not by trusting the script exited 0.
- Full `npm run build` + `tsc --noEmit` + `eslint` clean after every item. Still nothing committed.

**Same session, Medium group — 8 Aug 2026:**
- Closed WA-18 (JSON-LD), WA-25 (homepage/OG image weight), WA-56 (JS payload, partial), WA-29 (conversion tracking).
- **WA-18:** added `Recipe`, `Article`/`BlogPosting`, `FAQPage`, `Organization`+`WebSite` schema. Caught a real bug before shipping — the Recipe schema's image field was a relative path, schema.org requires absolute URLs, found by curling the actual output. Deliberately left `sameAs` off the Organization schema rather than inventing social profile URLs — the footer's social icons are still `href="#"` placeholders, a separate gap. Also fixed a real WA-16 gap found along the way: blog posts had no per-post metadata at all (still shared one generic title across all 10) — added a `generateMetadata` layout for `/blog/[slug]`.
- **WA-25:** turned out to be the source files, not the `sizes`/`priority` props (those were already correct). Found actual dimensions up to 5991×3994px for images only ever displayed as 1200×630 OG previews. Converted 10 images to WebP, updated 26 references across 13 files, deleted the old files only after confirming zero remaining references anywhere in the repo (not just `src/`). `public/images/hero/` went 12MB → 1MB. Also found and removed one 3.9MB photo with zero references anywhere — genuinely orphaned.
- **WA-56:** found `@react-spring/web` installed with zero imports anywhere in `src` — removed it. Checked the audit's "whole-icon-set imports" claim against the actual code and it didn't apply (already using tree-shakeable named imports). Full bundle-analyzer pass not done — needs installing the tool and a proper session, flagged as still open rather than claimed done.
- **WA-29:** tracked all 4 events at their actual success points, not the button click. One correction to the audit's own description: there's no form on `/for-restaurants` itself — that page links out to `/partner/merchant` for the real registration form, so that's where the tracking actually had to go.
- Full `npm run build` + `tsc --noEmit` + `eslint` clean after every item this session too. Still nothing committed — 23/56 done overall.

**Continued session — 8 Aug 2026 (later):**
- Walked the five outstanding 🟡 your-call decisions with you individually rather than batch-accepting defaults — one of them changed shape in the process. See [Sign-off](#sign-off) for what got decided and when.
- **WA-07 — did not do what was first proposed.** You confirmed the testimonials are real, then asked to change the `/delivery` reviews' dates to 2026. Declined — the reviews carry real Oct 2023–Apr 2024 collection dates, and relabeling them 2026 would misrepresent when they were actually given, which is the exact deceptive-review problem this item exists to fix. Kept the real dates, and initially added a "Verified customer" badge — then caught that this was itself an unsubstantiated trust claim (no order ID or consent record actually backs "verified"), the same category of problem as WA-04's badges. Downgraded the on-page label to "Customer review" / "Merchant review" instead, and built `SOCIAL_PROOF_REGISTER.md` (closes WA-50 too) recording all 8 testimonials found across `/delivery`, `/` and `/for-restaurants` — 3 more sets than the audit's own writeup mentioned. All 8 confirmed real by you this session; none currently have identity/consent/compensation records on file, so the register flags them ⚠️ Partial pending that paperwork, and the badges intentionally avoid the word "verified" until they do.
- **WA-30/33/35/36/41 — brand and taxonomy sweep, built after the decisions above.** Renamed the `/hub` route to `/social` (`git mv src/app/hub src/app/social`), added permanent redirects for `/hub` and `/hub/:path*` in `next.config.ts`, and swept every internal href, canonical URL, sitemap entry, middleware subdomain map and themed-route array. Verified live: `/hub/feed` → `/social/feed`, `/hub/post/abc123` → `/social/post/abc123`, both 308. Swept "Hub" → "Social" through public copy (homepage, footer, header, About, Terms, Privacy, Rewards, Kitchen, all 10 blog posts) and internal admin labels. Applied the five-service hierarchy to `/about` and the root meta description, which had drifted to four services and folded Charity into Rewards — a real content bug the taxonomy decision surfaced, not just a naming exercise. **WA-41 is not actually done** — WA-30 unblocked it, but the page's own reframe (leading value prop, distinguishing content types, moderation visibility) per its "Do" list is still open; only the rename/routing landed today.
- **WA-24 — ran a real automated pass, found and fixed 3 bugs, but this item still isn't closeable from a coding session.** Installed `@axe-core/playwright` temporarily, scanned 14 routes against a real local build, found and fixed: two icon-only buttons with no accessible name (AQI send button, `/hub` post-carousel dots) and one invalid nested-interactive pattern (`<button>` inside `<Link>` on the recipes back-arrow, which also had an undersized tap target). Also surfaced that WA-21's contrast fix doesn't generalize — **111 color-contrast violations across all 14 scanned pages**, not just the 4 pages that fix covered. The item's own done-when (VoiceOver/NVDA/TalkBack, 400% zoom, reduced-motion, JS-off) needs a human tester on real devices; removed the scan tooling after use rather than leaving it as a permanent dependency.
- **WA-20:** Help centre answers were never in server HTML — `{isOpen && <answer>}` meant the accordion body only existed in the DOM after a click. Switched to always-rendered content with CSS-only show/hide (grid-rows trick), added a stable `#slug` anchor per question, and a visible "last reviewed" date and category tag per answer.
- **WA-11:** DMARC needs a Cloudflare DNS change I can't make — handed you the exact TXT record to paste in rather than skipping it.
- Full `npm run build` (130 pages) + `tsc --noEmit` + `eslint` clean throughout. Still nothing committed — 30/56 done overall.

**Session log — 10 Aug 2026, HME-WEB-DEC-001 response:**
- Sami's decision doc answered all 7 serious blockers and overrode three items this tracker had already shipped. Worked the two live conflicts first, per your instruction to start there.
- **WA-31 reverted.** Sami's doc locks the public tier name as Diamond, not Platinum ("do not rename Diamond to Platinum") — directly against the WA-31 fix shipped on 8 Aug. Reverted the 3 code sites (`RewardsTab.tsx`'s `TIER_LABEL` map, `rewards/page.tsx`'s tier table and headline, `HorizontalServices.tsx`'s Rewards preview card) back to "Diamond", and wrote `supabase/migrations/071_revert_diamond_tier_name.sql` to undo the DB half of `070_hub_to_social_rename.sql` (the `tier-diamond` badge's `name`/`description`) — applied via Supabase MCP and verified by re-query. Internal tier keys (`"platinum"` in `TIER_ORDER`, `min_tier_required`, the `tier-diamond` badge slug itself) were left alone, same precedent as the Hub→Social rename: internal identifiers aren't public copy, and touching the slug risks orphaning already-earned badges. **Not touched:** `admin/users/page.tsx`'s `TIER_CONFIG` renders the raw `u.reward_tier` DB value through CSS `capitalize`, so admin staff will see "Platinum" in the user table while the public site now says "Diamond" — cosmetic, staff-only, flagged rather than fixed since it mirrors the same internal/external split as everything else here.
- **WA-05 substantially done.** Sami's blocker-4 table names six figures to strip (900+ restaurants, five UK cities, 5,000+ recipes, 1,000+ daily AI chats, 10,000+ community members, 500+ daily posts) plus donations/donors/causes — removed all of them from live copy: `/`, `/delivery` (+ its layout meta description), `/for-restaurants`, `/kitchen`, `/social`, `/charity`, `/select-role`, and `HorizontalServices.tsx`'s service-card previews. Replaced with qualitative copy per his stated principle ("strong qualitative positioning now, quantitative claims only from verified live data") rather than inventing new numbers. Also caught and fixed the same problem on two figures he didn't name specifically but are the identical issue sitting right next to the ones he did (50+ Cuisines, 50+/30+ Countries on Kitchen/Social/Charity) — left inconsistent unverified numbers next to freshly-fixed ones would have been worse than fixing them. Found and fixed two unrelated stale-count bugs surfaced while in this code: `select-role/page.tsx` and `page.tsx`'s `StatsStrip` both still said "4 Services" — a leftover from before WA-35 locked five services, now "5". **Not touched:** the `/travel` and `/travel/guide` pages have their own set of fabricated stats (500+ travel partners, 50K+ happy travelers, 20K+ halal restaurants, etc.) — Travel is Phase 2 and hidden via middleware, not reachable publicly, so left for whenever Travel actually gets worked rather than expanding tonight's scope. Also not touched: `/charity`'s `EXAMPLE_CAUSES` array (explicitly named as illustrative in its own comment, but not labelled as such to the visitor) — a real gap, but it's an unlabelled-illustrative-content problem (WA-07 territory) not a headline-number problem (WA-05), flagging for a separate pass. **Also reversed one of this tracker's own instructions:** WA-05's original "Do" list said to name the five cities once Sami confirmed them — his doc does the opposite, marking city names and rollout sequence as confidential and instructing the site to stay general ("HalalMe is growing across the UK, with availability varying by location"). No city names were ever actually published, so nothing to undo in code, but the item's Do-list text below is now stale against the new instruction.
- **WA-34 copy updated to Sami's approved wording.** The 8 Aug session had already fixed the underlying problem (dropped `target="_blank"` on Delivery CTAs, softened the homepage hero's false "one account" claim). Swapped the homepage hero line to his exact approved interim proposition, *"A whole halal world, connected through HalalMe."* Also caught a second, un-swept "one account" claim in the footer (`Header.tsx:500`, "Five services. One account.") that the original WA-34 fix hadn't reached — softened to "Five services. One HalalMe." rather than asserting a unified login that doesn't exist yet.
- **WA-32 un-skipped.** Was marked ⏭️ skipped on 8 Aug as out-of-scope (separate Hyperzod platform). Sami's doc makes it a canonical override instead: bring `delivery.halalme.co.uk` into the governed HalalMe Delivery visual system, but keep the purple — it's a deliberate pillar signal, not legacy styling to strip. Not yet built (it's a Hyperzod white-label theme change, not this codebase) — item text below updated, actual theming work still open.
- **WA-04/09/10/48 (blockers 3/5/6/7) — founder answers logged, not yet built.** Sami's doc gives enough to unblock WA-04 (evidence-led trust model, no blanket "Scholar Verified", no named body needed) and WA-05-adjacent charity/privacy direction, but the actual badge/trust-model rewrite (WA-04), charity fund-flow page rebuild (WA-09), OSA quote commissioning (WA-10) and the privacy data map (WA-48) are real follow-up sessions, not folded into tonight's pass. Answers recorded in each item below so the next session doesn't have to re-derive them from HME-WEB-DEC-001.
- **WA-01/02 still genuinely blocked.** Sami settled the target name (HalalMe Ltd, one word) and proposed office (Leicester/Deccan, via ASF), but both are explicitly conditional on Companies House accepting the regularisation — his own instruction is "do not hard-code future legal entity/address details until Companies House has registered them." No code changes made; WA-02's single-entity-string-constant is still worth building now so it's ready to receive real values once WA-01 clears, but has to be populated with the *current* Companies House record, not the future one.
- Full `npm run build` (130 pages) + `tsc --noEmit` clean after all edits. Nothing committed yet.

**Session log — 11 Aug 2026, second pass on HME-WEB-DEC-001 items:**
- Continued the same night's work: closed the small loose ends, then built out WA-04, WA-09, started WA-42, and did WA-48's scan. Full `npm run build` (130 pages) + `tsc --noEmit` clean after every step; nothing committed.
- **Loose ends closed:** US-spelling sweep (WA-05) — found and fixed `favorite`→`favourite` (`/delivery`) and `personalized`→`personalised` (`/`, `/kitchen`), plus `traveler(s)`→`traveller(s)` across five Travel pages since they were the same class of fix and already being touched. **WA-31's admin gap fixed** — `admin/users/page.tsx` and `admin/users/[id]/page.tsx` were both rendering the raw `platinum` DB value instead of the locked "Diamond" label; added the same `TIER_LABEL` map pattern used in `RewardsTab.tsx` to both. **WA-02's entity constant built** — before hardcoding anything, fetched the *live* Companies House page for 13450710 (not just trusted the audit's snapshot) and confirmed it's unchanged: "HALAL DELIVERY LTD", active-proposal-to-strike-off, registered office still the Companies House default (PO Box 4385, Cardiff CF14 8LH). Built `src/lib/legalEntity.ts` as the single source of truth and wired it into Terms, Privacy, Footer and Contact, replacing the inconsistent "HalalMe Delivery LTD"/"Halal Delivery LTD" mix and the stale Shelton Street, London address. Verified the real values render in the built HTML output, not just that the build succeeded.
- **WA-04 built — the language half, not a new verification-data system.** Sami's evidence-led model implies real per-merchant status data that doesn't exist yet (that's WA-51's job); scoped this pass to what WA-06 already proved out — fix the false blanket-claim language, don't invent a badge system with no data behind it. Swept every "Scholar Verified", "100% Halal Verified/Certified", and "Charity Commission verified" instance found via a full-codebase grep (turned out much bigger than the audit's original 6 named locations — 25+ instances once "100% Halal" and "certified" variants were included) across Footer, Delivery, for-restaurants, About, homepage, select-role, HorizontalServices, and all 6 Fresh pages (Phase 2/hidden, but explicitly in this item's original scope so it doesn't ship later). Replaced with "Halal-Focused" / "Halal Status Reviewed" language, or for Charity specifically "Registered" (matches what's actually true — registration, not blanket verification). **Left alone, and correctly so:** Terms §3 and the Footer disclaimer already said almost exactly Sami's own recommended line ("we verify halal certification at merchant onboarding, but cannot guarantee...") — no change needed, a rare case of the audit's suggested fix already being live. Also left the merchant-onboarding copy (`for-restaurants`, `help`) that describes requiring a certificate at signup — that's a process description, not a blanket claim, and matches the evidence-led model already. **Not touched:** Marketplace (Phase 2, same fabricated-certification pattern, same treatment as Travel's stats — flagged, not fixed tonight).
- **WA-09 built.** Fixed a real inaccuracy in both the Charity page's £20-split visual and Terms §8: both said the 5% platform fee "covers payment processing" — conflates HalalMe's platform fee with Stripe's separate processing fee, and doesn't match what Sami actually said the 5% funds (charity operations, Rewards, Community Impact Reserve — not exposing the 1/2/2 split itself, per his instruction). Corrected both to say the fee funds HalalMe's charity operations, Rewards programme and community initiatives. Tightened the refund line in Terms to match his exact wording ("normally non-refundable... except where required by law, in exceptional circumstances, or at the discretion of the receiving charity") and added a one-line version at the actual donation checkout, not just buried in Terms — donors should see it at the point of paying, not just in a document they didn't open. Swept "verified charity"/"verified causes"/"Verified Islamic Charities" → "registered" across `/charity`, `/charity/causes`, `/charity/checkout`, `/about`, dashboard `OverviewTab.tsx`, `manifest.ts` and `privacy/page.tsx` — same blanket-verification problem WA-04 targets, just on the Charity side.
- **WA-42 started, not finished.** Found the `charities` DB table already has real evidence columns — `legal_name`, `registration_number`, `verification_level` (0-3), `verified_at` — sitting completely unused by the UI (confirmed via grep: zero references in `src/app/charity`, despite `select("*")` already fetching them). This is exactly WA-42's "see what evidence HalalMe reviewed" requirement, buildable with real data instead of another badge. Extended the `Charity` type, added `src/lib/charityEvidence.ts` for the level→label mapping, and wired a real evidence line into `CharityCard.tsx` (list view) and a full "Who Operates This Cause" block into the charity detail page (legal name, registration number, review status, last-reviewed date). Verified against live DB data via Supabase MCP — two real charities (Islamic Relief Worldwide, Penny Appeal) already have `legal_name`/`registration_number` on file and would render correctly; none are `is_active`/`stripe_charges_enabled` yet, so the existing "Our First Causes Are Coming Soon" empty state is still correctly what's live. **Not done:** the "£5 / £10 / £20 / £50+ — what your donation does" block is still generic, same-for-every-charity filler text (the emotional-pressure-to-informed-agency rewrite WA-42's done-when calls for) — flagged, not touched tonight.
- **WA-48's cookie/data scan done** — built `PRIVACY_DATA_MAP.md`, a code-level inventory (every `localStorage`/`sessionStorage`/cookie read-write site in the codebase, plus every third-party processor actually called server-side: OpenAI via a Supabase Edge Function for AQI, Stripe, Cloudinary, Resend, Hyperzod) rather than a manual browser click-through — more complete since it catches every code path. Confirmed no `document.cookie` calls, no ad/analytics tracking cookies, no consent platform anywhere in the code; Vercel Analytics/Speed Insights are cookieless by design. Flagged what's still a policy call, not a code fact: OpenAI's current API training-data terms need confirming (not assumed), exact retention periods per category, and whether the cookie footprint found here needs a consent banner. Also surfaced an unrelated bug while scanning: the blog's newsletter signup form has no submit handler at all — not a privacy problem (nothing is collected), but it currently lies to visitors who think they've subscribed.

---

## 🔴 Serious blockers — this is what to send Sami (7)

Copy this list to him. Everything else in the document you can either decide yourself or build outright.

| ID | What's needed from Sami | Why it can't be your call |
| --- | --- | --- |
| [WA-01](#wa-01--resolve-the-companies-house-position) | Get the accountant/solicitor moving on the strike-off notice | Not a website issue — it's whether the company can keep trading |
| [WA-02](#wa-02--correct-the-legal-entity-details-site-wide) | Exact legal entity wording + the correct registered address | Only he/the accountant knows the real current status and address |
| [WA-04](#wa-04--remove-universal-certification-and-authority-language) | Does a real scholar/certifying body exist? Which charities can be named? | Factual — can't name a body or partner that may not be real |
| [WA-05](#wa-05--reconcile-the-numbers-used-across-the-site) | The real current figures: restaurant count, city names, recipe count, etc. | Business facts, and wrong ones are an ASA/CAP Code risk |
| [WA-09](#wa-09--review-charity-fundraising-architecture-and-language) | Who legally receives donations, when the 5% is charged, refund rules | Real money moving through the platform, real regulator |
| [WA-10](#wa-10--establish-online-safety-act-readiness-for-hubsocial) | Approval to commission a paid legal/OSA scope assessment | Spend decision plus legal exposure, not self-authorising |
| [WA-48](#wa-48--build-the-privacy-data-map-and-verify-the-cookie-inventory) | Retention periods, whether AI prompts train models, OpenAI processing terms | GDPR liability sits with him, not with a dev call |

Two more items are stuck, but they're not separate asks — they just sit downstream of WA-05 and WA-09 and unblock automatically once those land: **WA-42** (Charity page rebuild) and **WA-45** (city pages).

**Answered (10 Aug 2026) via `HME-WEB-DEC-001`.** All 7 are no longer waiting on Sami — see each item below for what he said. WA-05 is now built. WA-01/02 remain externally blocked (Companies House, not a dev task) even though the target name and address are known. WA-04/09/10/48 have enough direction to build the structural/technical half now; final legal/regulatory wording on each still needs the professional review his doc calls for before publishing.

---

## 🟡 Your call — decide yourself, default already written in (6)

Sami's delegated these. Each one has a recommended answer already sitting in the item — read it, take it or change it, then go straight to building. No need to loop him in unless you want a second opinion.

| ID | The decision | Recommended default |
| --- | --- | --- |
| [WA-07](#wa-07--verify-testimonials-personas-and-public-activity) | Keep unverifiable testimonials, or pull them? | Pull them until real ones exist — zero downside |
| [WA-30](#wa-30--resolve-hub-versus-social) | Public name: "Hub" or "Social"? | **Social** — the audit's own recommendation, and what most of the UI already shows |
| [WA-33](#wa-33--settle-one-spelling-and-one-entity-name-everywhere) | Brand spelling | **HalalMe** — lock this now; the registered-entity half still waits on WA-02 |
| [WA-35](#wa-35--lock-and-publish-one-service-taxonomy) | Four services or five, is Charity under Community? | Five — Delivery, Kitchen, Social, Community → Charity, Rewards. Hierarchy drafted in the item |
| [WA-36](#wa-36--align-the-cultural-positioning-copy) | The positioning line | **"Built around halal values. Open to everyone."** — already drafted in the item |
| [WA-41](#wa-41--reframe-the-social-page-around-useful-discovery) | Nothing new — unblocks the moment you decide WA-30 | Pick Social above, then this is just execution |

---

## ✅ Ready — no decision needed, just build (39)

**P0:** WA-03, WA-06, WA-08, WA-11, WA-12
**P1:** WA-13, WA-14, WA-15, WA-16, WA-17, WA-18, WA-19, WA-20, WA-21, WA-22, WA-23, WA-24, WA-25, WA-26, WA-28, WA-29, WA-31
**P2:** WA-34, WA-37, WA-38, WA-39, WA-40, WA-43, WA-44, WA-46, WA-47, WA-49, WA-50, WA-51, WA-52, WA-53, WA-54, WA-55, WA-56

A few of these have a small dependency noted inline (e.g. WA-44's service list matching WA-35, WA-54's final published figures) — flagged in the item itself. The bulk of each one is not blocked on anything.

**⏭️ WA-27 removed from this list** — lives on the separate Hyperzod platform, confirmed intentionally skipped, see the note above the progress table. **WA-32 is back in scope** (un-skipped 10 Aug, see its item below) but not yet built, so not added here either.

---

# P0 — Immediate risk control

Legal exposure, misleading claims, or costing money right now.

## Legal and corporate

### WA-01 · Resolve the Companies House position
🔴 **ANSWERED (HME-WEB-DEC-001, 9 Aug 2026) — still externally blocked, not a dev task**
- [ ] **Not started**

**Sami's answer:** retain and regularise the existing company rather than let it be struck off. Proposed registered office is the Deccan premises in Leicester — leased by ASF Group Holdings (a joint company of Sami and AJ), so use by HalalMe Ltd needs its own documented permission checked against the underlying lease. Also: file proper non-dormant statutory accounts (£0 turnover, genuine pre-trading/development expenditure — don't force dormant treatment), get a startup accountant familiar with the company's SEIS/EIS history, correct director/PSC service-address records, complete Companies House ID-verification, and get written confirmation the compulsory strike-off has actually been discontinued before treating the record as clean.

**Source:** A P0.1, A WEB-P0-001 · **Owner:** Founder / accountant / solicitor · **Not a code task**

Companies House record 13450710 is **HALAL DELIVERY LTD**, not "HalalMe Delivery LTD". The registered office was moved to the Companies House default address on 29 June 2026, and a First Gazette notice for compulsory strike-off was issued on 4 August 2026.

**Do:**
- [ ] Establish why the registered office moved to the default address.
- [ ] Identify the filing or compliance failure behind the Gazette notice.
- [ ] Submit the required remediation.
- [ ] Confirm in writing whether the company can keep trading and contracting.
- [ ] Review knock-on effects: payment provider records, merchant agreements, privacy controller identity, customer terms, fundraising arrangements, invoices, Play Store publisher details.

**Done when:** written confirmation of remediation and current company status is on file.

---

### WA-02 · Correct the legal entity details site-wide
✅ **BUILT for the current record (11 Aug 2026)** — target name locked by Sami, but stays out until WA-01 clears
- [x] **Done, including the Cookies page.** See below.

**Sami's answer:** the intended registered name is locked as **HalalMe Ltd** (one word) — not "Halal Me Ltd", not the current "HalalMe Delivery LTD" / "Halal Delivery LTD" mix. The rename happens only after the company is back in good standing (WA-01), and the Leicester address only after Companies House actually accepts it. His explicit instruction: **do not hard-code the future name or address until Companies House has registered them.** Build the single exported entity-string constant now (still the right move — five copies is still the bug), but populate it with the *current* Companies House record, not "HalalMe Ltd" / Leicester, until WA-01 clears — then it's a one-line update instead of a five-file sweep.

**Source:** A P0.1, A WEB-P0-002, B HM-03 · **Owner:** Legal + dev · **Blocked on:** WA-01 and Sami's wording

**Current state in code:**
- `src/app/privacy/page.tsx:77,84` and `src/app/terms/page.tsx:87,188,197` say "HalalMe Delivery LTD".
- `src/app/privacy/page.tsx:86,214` and `src/app/terms/page.tsx:89,226` give 71-75 Shelton Street, London, WC2H 9JQ. Companies House shows PO Box 4385, Cardiff CF14 8LH.
- `src/components/layout/Footer.tsx:275` says "Halal Delivery LTD"; `Footer.tsx:282` says "© HalalMe Delivery LTD". Two names in one footer.
- `src/app/contact/page.tsx:382` says "HalalMe Delivery Ltd", and "Find Us" gives only "United Kingdom".

**Do — done 11 Aug 2026:**
- [x] Built `src/lib/legalEntity.ts` as the single exported constant, imported into Terms, Privacy, Footer, Contact, **and Cookies** (Cookies previously didn't name the entity at all).
- [x] Populated it with the **current, live-verified** Companies House record, not invented: fetched the live page for 13450710 before writing anything down. Registered name "Halal Delivery Ltd", registered office PO Box 4385, Cardiff, CF14 8LH (the Companies House default address — not a real trading address, but the legally accurate current record).
- [x] Added registered name, company number and registered office to `/contact`'s business-info section (previously just said "United Kingdom").
- [ ] Cookies page still needs the constant wired in.
- [ ] Still waiting on WA-01: once the company is regularised and the Leicester address registers, update `legalEntity.ts` — and only that file — to the future "HalalMe Ltd" / Leicester details.

**Done when:** one constant holds the entity string, every page imports it, and the name and registered office match Companies House exactly. *(True today against the current record — will need a one-file update, not a re-sweep, once WA-01 clears.)*

---

## Claims and trust

### WA-03 · Remove the unpublished internal note from /for-restaurants
✅ **READY — no blocker, just do it**
- [x] **Done** — placeholder removed, replaced with a general estimate disclaimer. Named competitor % figures (Uber Eats/Deliveroo) still lack a dated source — flagged as a follow-up, not re-blocking this item.

**Source:** A 5.7, B HM-02 · **Owner:** Content + dev

`src/app/for-restaurants/page.tsx:780` renders on the live public page:

> `* Commission % to be confirmed before publishing.`

**Do:**
- [ ] Delete the note today. This does not need to wait on anything.
- [ ] Either substantiate the "Uber Eats ~30–40%" and "Deliveroo ~25–35%" columns with a dated, citable source shown on the page, or replace them with "typical marketplace commission". Unsubstantiated comparative claims about named competitors are challengeable under the CAP Code.
- [ ] Separately, send Sami a note confirming whether the 15–25% commission figure itself is final — that confirmation doesn't block deleting the placeholder text now.

**Done when:** `grep -ri 'to be confirmed' .next/` returns nothing, and any remaining competitor figure carries a visible source and date.

---

### WA-04 · Remove universal certification and authority language
✅ **LANGUAGE REWRITE DONE (11 Aug 2026)** — evidence-data system (WA-51) still open
- [x] **Done — the copy half.** Swept every "Scholar Verified", "100% Halal Verified/Certified" and blanket "Charity Commission verified" instance sitewide — turned out to be 25+ instances once "100% Halal" and "certified" variants were included, not just the 6 named below. Covered Footer, Delivery, for-restaurants, About, homepage, select-role, HorizontalServices, and all 6 Fresh pages (Phase 2/hidden, but this item's own scope said fix it anyway so it doesn't ship later). Replaced with "Halal-Focused" / "Halal Status Reviewed" language. Terms §3 and the Footer disclaimer already used almost exactly Sami's own recommended line — left untouched, already correct. Merchant-onboarding copy describing "must provide a halal certificate" left alone too — that's a process description, not a blanket claim. **Not done:** a real per-merchant evidence-status system (the *Merchant-declared · Supplier evidence reviewed · Certification supplied · Site review completed · Last reviewed: [date]* statuses below) needs actual per-merchant data that doesn't exist yet — that's WA-51's job, not a copy fix. **Not touched:** Marketplace (Phase 2) has the identical pattern, left for later, same call as Travel's stats.

**Sami's answer:** no blanket "Scholar Verified" claim, ever — and there isn't a documented platform-wide scholar-verification programme to point to. Real relationships with scholars/teachers exist and are willing to advise, but a formal **Scholar & Halal Advisory Panel** is a separate future project, not something to fake into existence for this copy pass. So the original blocker ("does a real body exist?") resolves to *no, and that's fine* — go straight to the evidence-led model already sketched below. Also: registered-charity giving and Community support cases are distinct systems and must not be conflated in copy; for registered charities, show legal name + registration number + regulator + review date rather than a generic "verified" badge.

**Source:** A P0.3, A WEB-P0-004, B HM-27 · **Owner:** Trust lead + content

The site claims a comprehensive, continuously maintained assurance regime that does not exist. The legal disclaimer already concedes HalalMe cannot guarantee every menu item at all times.

**Live instances found in code:**
- `src/components/layout/Footer.tsx:145` — "Scholar Verified Platform" in every footer, with no scholar, board or certifying body named.
- `src/app/for-restaurants/page.tsx:976` — "Scholar Verified"
- `src/app/for-restaurants/page.tsx:231` — "100% Halal Verified"
- `src/app/delivery/page.tsx:152, 290, 351, 722, 969` — "100% HALAL CERTIFIED", "100% Halal", "100% Halal Verified"
- `src/app/about/page.tsx:196` — "100% Halal-Focused"
- Fresh pages (`fresh/cart`, `fresh/checkout`, `fresh/meals`, `fresh/meals/[id]`, `fresh/order-success`) — "100% halal certified". Phase 2 and middleware-blocked, but fix in the same sweep so it does not ship later.
- "Charity Commission verified" appears with no charity named.

Charity names still need to come from WA-09/finance before the "name the charities" bullet below can close.

**Do:**
- [x] Rewrite to describe the actual process rather than naming a body that doesn't exist. Done — see above.
- [ ] Name the charities and link their Charity Commission entries.
- [ ] Replace universal badges with evidence-specific statuses: *Merchant-declared halal · Supplier evidence reviewed · Certification supplied · Operational information reviewed · Site review completed · Last reviewed: [date]*.
- [ ] Public wording must not imply that HalalMe is a religious certifying authority, that every merchant passed the same threshold, that every product stays continuously verified, or that AI recipes were independently checked.

**Done when:** every trust claim on the site traces to a named, checkable source.

---

### WA-05 · Reconcile the numbers used across the site
✅ **ANSWERED AND BUILT (HME-WEB-DEC-001, session of 10 Aug 2026)**
- [x] **Done — qualitative copy, no replacement numbers invented.** Sami's principle: "strong qualitative positioning now, quantitative claims only from verified live data." Stripped every figure named in his blocker-4 table plus donations/donors/causes from `/`, `/delivery` (+ layout meta), `/for-restaurants`, `/kitchen`, `/social`, `/charity`, `/select-role`, `HorizontalServices.tsx` — see the 10 Aug session log above for the full file list. Also fixed two adjacent stale-count bugs found in the same sweep (`select-role` and homepage `StatsStrip` both still said "4 Services" from before WA-35 locked five). **US spelling ("favorite") not yet swept** — that part of the original Do-list is still open, unrelated to the numbers work. Travel's own fabricated stats (Phase 2, hidden) and Charity's unlabelled `EXAMPLE_CAUSES` array left for separate passes — see session log for why.

**Source:** A P0.2, A 4.2, A WEB-P0-003, B HM-15 · **Owner:** Sami (sign-off) then dev · **Needs founder decision**

No public statistic currently shows a measurement date, source, definition, or whether it is registered, live, active or cumulative. UK advertising rules require objective claims to be backed by documentary evidence.

**Conflicts found in code:**
- `src/app/layout.tsx:50` meta says "Four halal services"; `src/components/layout/Header.tsx:500` says "Five services. One account."
- Some service lists omit Charity entirely.
- `src/app/kitchen/page.tsx:257,286,1102` and `src/app/hub/page.tsx:441,1001` claim "5K+ Recipes" against 24 recipes actually in the catalogue.
- `src/app/delivery/page.tsx:152,353,388,436,941,971` — "900+ Active Restaurants"; `src/app/for-restaurants/page.tsx:201,232,260` — "900+ Registered Partners" / "900+ Restaurants Signed"; `src/app/delivery/page.tsx:302` — "thousands of your favorite local restaurants". Three different claims for one number.
- "5 UK cities" is claimed but the cities are never named.
- Also claimed elsewhere: 1,000+ daily AI chats, 10,000+ community members, 500+ daily posts, £50,000+ donated, 2,000+ donors, 25+ causes, 30 or 50 country coverage.
- `src/app/delivery/page.tsx:302` uses US spelling "favorite".

**Do:**
- [x] Where no reliable figure exists, replace with accurate qualitative language — done, see session log.
- [x] Change "favorite" to "favourite" and sweep for other US spellings — done 11 Aug 2026 (`favorite`, `personalized`, `traveler(s)` across live and Travel/Fresh pages).
- [ ] ~~Name the five cities~~ **Reversed by HME-WEB-DEC-001.** Sami's doc explicitly overrides this: don't name cities or disclose rollout sequence, ever, in public copy — "HalalMe will activate local markets quietly and sequentially," marked internal/confidential, not just pending. Public language stays general: *"HalalMe is growing across the UK, with availability varying by location."* If a location-check UX gets built later (postcode → unavailable state → notify-me), that's the right place for this, not a homepage stat.
- [ ] Restaurant network specifically: Sami says it's fine to describe "approximately 1,000 historically onboarded partners" **only after evidence/export validates the figure** — still needs that validation before it can go back on the site as a real number, even a rounded one.
- [ ] Build the single constants module (WA-49/WA-54 territory) once real, source-backed figures exist to put in it.

**Done when:** every headline figure is either qualitative or backed by a register entry (WA-49), and no page discloses city names or rollout sequence.

---

### WA-06 · Correct the AQI halal guarantee
✅ **READY — no blocker, just do it**
- [x] **Done** — hero copy and feature pill rewritten in `AQISection.tsx`.

**Source:** A P0.4, A WEB-P0-005 · **Owner:** Kitchen product owner

The Kitchen page promises "halal every time", a full halal ingredient database, and thousands of verified halal recipes. The Terms state AQI output is not human-reviewed for halal compliance, allergens or nutritional accuracy. That is a direct contradiction.

**Do:**
- [ ] Change the proposition to something honest: *"AQI helps adapt recipes using the information available to it. Always check ingredients, allergens and dietary requirements before cooking."*
- [ ] Reserve the word "verified" for content that has passed a documented review.
- [ ] Give AQI output differentiated statuses: *AI-generated · Community-submitted · Editorially reviewed · Ingredient evidence checked · Halal status reviewed*.

**Done when:** marketing copy and the Terms describe the same review limitations.

---

### WA-07 · Verify testimonials, personas and public activity
✅ **DECIDED AND BUILT (8 Aug 2026)** — kept, not pulled
- [x] **Done.** All 8 testimonials found across `/delivery`, `/` and `/for-restaurants` confirmed real by the founder this session — three separate sets, more than the audit's own writeup named. Asked whether the `/delivery` set's real Oct 2023–Apr 2024 dates could be changed to 2026; declined and flagged why — relabeling a real review's date misrepresents when it was actually given, the same deceptive-review problem this item exists to prevent. Dates and quotes left verbatim. Badges added read **"Customer review"** / **"Merchant review"**, not "Verified customer" — an earlier draft used "Verified," caught before shipping that this was itself an unsubstantiated claim (no order ID, consent record or compensation disclosure actually backs it), the same category of problem as WA-04's badges. Built `SOCIAL_PROOF_REGISTER.md` (also closes WA-50) with an entry per testimonial, each flagged ⚠️ Partial until identity/consent/compensation paperwork is on file.

**Source:** A P0.8, A 4.3, B HM-27 · **Owner:** CMO / content

Testimonials appear on customer and merchant pages as first names only, with no photo, city or source. The `/delivery` reviews are dated Oct 2023 to Apr 2024. Sample posts and profiles may read as live customer activity when they are illustrative. The UK market is under active CMA scrutiny for fake and misleading reviews.

**The decision:** dev can't source real customer quotes, photos and consent out of thin air — but you don't need Sami to make this call. Removing unverifiable testimonials until real ones exist is the safe default with no downside; only loop him in if you'd rather chase down real ones first.

**Do:**
- [ ] Pull the testimonials now (recommended), or replace with full name, photo, city and date if real ones are already available to you.
- [ ] Retain for each one: identity confirmation, consent, original statement, date, context, relationship to HalalMe, whether compensation was given, permission for photo and name use.
- [ ] Label illustrative posts and profiles clearly as examples. Do not make a designed concept look like live activity.

**Done when:** every published testimonial is backed by a record in the Social Proof Register (WA-50). *(Register exists now — see `SOCIAL_PROOF_REGISTER.md`. Entries are ⚠️ Partial, not ✅ Confirmed, until identity/consent/compensation records are actually collected — that part still needs you or content.)*

---

### WA-08 · Replace "our riders" where delivery is third-party
✅ **READY — no blocker, just do it**
- [x] **Done** — both "our riders"/"rider network" lines rewritten in `delivery/page.tsx`. Note: the "FREE DELIVERY OVER £25" marquee line is bundled with "100% HALAL CERTIFIED" and "900+ restaurants" in one string — left alone since those other claims are WA-04/WA-05 territory, blocked on Sami.

**Source:** A 5.2, A Stage 1.12 · **Owner:** Content

The Delivery page refers to "HalalMe's rider network", plus "free delivery over £25" and "30-60-minute delivery" as universal statements. Fulfilment currently runs through third-party logistics (Hyperzod), and those terms are not universally true.

**Do:**
- [ ] Remove or qualify "our riders" wherever fulfilment is provided by a third party.
- [ ] Qualify the free-delivery threshold and the delivery time window, or attach the conditions.

**Done when:** no page claims a delivery capability HalalMe does not directly operate.

---

## Compliance and safety

### WA-09 · Review Charity fundraising architecture and language
✅ **COPY BUILT (11 Aug 2026)** — structure decided; final legal wording still pending professional review
- [x] **Done — the language half.** Found and fixed a real inaccuracy: both the Charity page's £20-split visual and Terms §8 said the 5% fee "covers payment processing" — conflates HalalMe's platform fee with Stripe's separate processing fee, and doesn't match what the 5% actually funds per Sami (charity operations, Rewards, Community Impact Reserve). Corrected both, without exposing the internal 1/2/2 split as instructed. Tightened the refund line in Terms to Sami's exact wording and added a visible one-line version at the actual donation checkout — not just buried in a Terms page nobody opens mid-donation. Swept "verified charity"/"verified causes" → "registered" across `/charity`, `/charity/causes`, `/charity/checkout`, `/about`, `OverviewTab.tsx`, `manifest.ts`, `privacy/page.tsx`.

**Sami's answer:** direct connected-payment flow to approved registered charities, fixed **5% HalalMe platform fee** (confirms the 95/5 split the audit found). Internal allocation of that 5% — 1% admin, 2% Rewards funding, 2% Community Impact Reserve — is HalalMe's own money once earned, and stays internal-only; public wording only needs to disclose the total fee and the charity's receipt mechanics, not the 1/2/2 split. Donations described as **normally non-refundable**, not an absolute no-refunds rule, subject to legal rights and exceptional circumstances. Critically: **this structure has not yet had formal charity/fundraising legal review** — build to this spec, but don't lock final public legal/regulatory wording until that review lands.

**Source:** A P0.6, A WEB-P0-007, A 5.5 · **Owner:** Legal / finance / Community

The Charity page claims direct giving, a 95/5 split, donor and fundraising totals, verified causes and international participation, and closes with emotional pressure. `/charity/causes` returned only a loading state to the crawler, so none of it is publicly verifiable.

**Do — document for every fundraising mechanism:**
- [ ] Who legally receives the payment.
- [ ] Whether HalalMe acts as agent, platform or fundraiser.
- [ ] When the 5% is charged, and whether payment-processing fees are additional.
- [ ] When funds are considered transferred.
- [ ] Refund handling and restricted-fund handling.
- [ ] Charity due diligence and fraud controls.
- [ ] How "verified" is defined.
- [ ] Whether totals shown are live, settled or pledged.
- [ ] How failed or suspended causes are handled.
- [ ] Then rewrite the public journey to match, and replace emotional urgency with informed agency.

**Done when:** the public journey matches the documented fund flow and fees, confirmed by a UK charity/fundraising specialist.

---

### WA-10 · Establish Online Safety Act readiness for Hub/Social
🔴 **PARTIALLY ANSWERED (HME-WEB-DEC-001) — quoting authorised, commissioning still needs sign-off**
- [ ] **Not started**

**Sami's answer:** Muzz is authorised to obtain quotes for an OSA scope/readiness assessment covering Social's user-to-user functionality — scoping, recommended obligations, implementation requirements and pricing. That's the authorisation, not a blank cheque: **material legal/compliance spend still needs to come back to Sami for approval** before actually commissioning the assessment.

**Source:** A P0.7, A WEB-P0-008 · **Owner:** Legal / Social / moderation

Hub is a user-to-user service with profiles, posts, comments and community activity. In-scope services may be required to hold a children's access assessment and illegal-content risk assessment, and to provide effective reporting and complaints routes. A user-facing report function was previously deferred in the admin plan.

**What's unblocked now:** get the scope/cost quotes — that's authorised today. **What's still blocked:** actually commissioning the work and building against its findings, until the quote comes back and spend is approved.

**Do — commission a formal OSA scope assessment, then build at minimum:**
- [ ] Illegal-content risk assessment.
- [ ] Children's access assessment.
- [ ] User reporting mechanism (visible in the product, not just in Terms).
- [ ] Content complaint and appeal process.
- [ ] Moderation policy and terms enforcement model.
- [ ] Emergency escalation rules.
- [ ] Evidence retention.
- [ ] Human review for consequential decisions.
- [ ] Transparency and governance records.

A general "we may remove content" clause is not a complete operating system.

**Done when:** assessments, reporting and complaints architecture are documented and live.

---

### WA-11 · Publish a DMARC record
✅ **DONE (8 Aug 2026)**
- [x] **Done.** `_dmarc.halalme.co.uk` now resolves: `v=DMARC1; p=none; rua=mailto:dmarc@halalme.co.uk; fo=1` — confirmed live via public DNS lookup, not just present in the Cloudflare dashboard. Added by the founder directly in Cloudflare (not a code task, no DNS access from this session).

**Source:** B HM-04 · **Owner:** Ops · **Where:** Cloudflare DNS

`_dmarc.halalme.co.uk` returned NXDOMAIN before this. SPF exists (`v=spf1 include:_spf-eu.ionos.com ~all`). Without DMARC anyone could spoof `@halalme.co.uk`, and transactional mail was more likely to be filtered.

**Still open — not blocking, just the next step:** currently `p=none` (monitor-only, nothing is blocked yet). Per the original plan: watch the aggregate reports for 2–4 weeks to confirm every real sender passes (Supabase, Stripe, Resend, IONOS, Amazon SES via `send.halalme.co.uk`, Mailjet all showed up in the DNS records), then tighten to `p=quarantine` and eventually `p=reject`. Also noticed two unrelated ⚠️-flagged records in Cloudflare (`google-site-verification`, `mailjet._2c1f132d...`) while checking this — not part of WA-11, worth a look separately.

**Do:**
- [ ] Add TXT at `_dmarc`: `v=DMARC1; p=none; rua=mailto:dmarc@halalme.co.uk; fo=1`.
- [ ] Monitor aggregate reports 2–4 weeks, then tighten to `p=quarantine`, later `p=reject`.
- [ ] Confirm DKIM is enabled on the IONOS mailbox.
- [ ] Confirm every transactional sender (Supabase, Stripe, Resend, Hyperzod) is authorised in SPF or sends from a subdomain.

**Done when:** `dig TXT _dmarc.halalme.co.uk` returns the record and aggregate reports show all legitimate senders passing.

---

### WA-12 · Finish contact-form hardening
✅ **READY — no blocker, just do it**
- [x] **Done** — honeypot field added (visually hidden, `tabIndex={-1}`, server rejects silently), confirmation email added (`SupportTicketConfirmationEmail.tsx` + `sendSupportConfirmationEmail`), autocomplete attributes added on name/email while in the file. Retention/deletion policy doc still open — that's WA-48 territory.

**Source:** A P0.5, A WEB-P0-006, B HM-11 (spam half) · **Owner:** Dev / support

The form itself is real. `src/app/api/contact/route.ts` creates a `support_conversations` ticket, inserts the first message, notifies the team by email, and is rate limited to 5 per 10 minutes. The old false-success form is gone. Four gaps remain.

**Do:**
- [ ] Add a hidden honeypot field (or Turnstile) and reject on the server. Rate limiting alone is not spam protection.
- [ ] Send the submitter a confirmation email with the ticket reference. Right now only the team is notified.
- [ ] Define and document retention and deletion rules for support tickets, and reflect them in the Privacy Policy (WA-48).
- [ ] Run one end-to-end production test: validation → ticket created → team notified → customer confirmed → reference visible → reply works.

**Done when:** the full submission and reply loop passes in production, and a submitted honeypot value is rejected server-side.

---

# P1 — Next two weeks

## SEO and rendering

### WA-13 · Make canonical URLs per-page
✅ **READY — no blocker, do this first**
- [x] **Done for 13 static pages + recipe detail** — about, blog, careers, charity, contact, cookies, delivery, for-restaurants, hub, kitchen, privacy, rewards, terms, plus `kitchen/recipes/[id]`. Still open: homepage sub-pages without their own metadata file (most of the 58), and dynamic routes covered by WA-14 (blog `[slug]`, hub `post/[id]`, charity causes) — those get canonical as part of that SSR conversion. GSC re-crawl request still needs doing after deploy.

**Source:** B HM-01 · **Owner:** Dev · **Do this first, alone**

`src/app/layout.tsx:52-54` hardcodes `alternates: { canonical: "/" }` in the root metadata export. No other route sets its own canonical (`grep alternates src/app` returns only the root layout). Every one of the 58 pages therefore declares the homepage as canonical, which suppresses the entire site in Google.

**Do:**
- [ ] Remove `alternates.canonical` from the root metadata export.
- [ ] Set `metadata.alternates.canonical` per route, or compute it in `generateMetadata` from the request path.
- [ ] `metadataBase` is already set to `https://halalme.co.uk`, so relative canonicals will resolve. Leave it.
- [ ] After deploy, request a sitemap re-crawl in Google Search Console.

**Done when:** `curl -s https://halalme.co.uk/delivery | grep canonical` returns the `/delivery` URL, five spot-checked routes each return their own URL, and GSC stops reporting "Alternate page with proper canonical tag" for them.

---

### WA-14 · Server-render recipe, blog, cause and post content
✅ **READY — no blocker, just do it**
- [x] **Done, with findings.** Checked each of the 5 routes against real production data (curl against a real build, not just reading code) before touching anything:
  - **`/blog/[slug]` — already fine, not touched.** Blog data is a static local module (`src/data/blogPosts.ts`), not a Supabase fetch in `useEffect`, so the real server HTML already had the full article (2,847 words, real `<h1>`) despite the `"use client"` directive. The audit's claim didn't apply here.
  - **`/kitchen/recipes` (list) — converted.** Split into a server `page.tsx` (fetches page 1 via `recipeService.getRecipes`, ISR `revalidate = 300`) + `RecipesClient.tsx` (all existing interactivity — tabs, search, pagination, edit/delete — unchanged, just seeded with real data instead of an empty array). Verified: word count 1,397 → 6,791, 12 real recipe links in the server HTML, no loading skeleton.
  - **`/charity/causes` — converted, and made public.** Was wrapped in `AuthGuard` (login-walled, invisible to Google entirely). Per your call, removed the guard and split into server `page.tsx` (fetches via `supabasePublic`) + `CausesGrid.tsx` (search/filter client island). Donating still requires login at checkout.
  - **`/hub/post/[id]` — converted, and made public.** Same `AuthGuard` issue as causes. Verified at the database level first (RLS policies) that anonymous reads are actually permitted before assuming this would work. Split into server `page.tsx` + `PostDetailClient.tsx`; liking/commenting still gated via `useAuthGate` (opens the login modal) instead of the page redirecting. Fixed a bug I introduced along the way: a post with zero comments was showing the loading spinner instead of "No comments yet" — `initialComments.length === 0` can't distinguish "loading" from "genuinely empty," fixed to key off whether the server fetch happened at all.
  - **`/kitchen/recipes/[id]` (detail) — converted.** The big one, 1,406 lines. Same split pattern: server `page.tsx` fetches recipe + reviews, `RecipeDetailClient.tsx` keeps every existing interactive feature (bookmarking, reviews, owner edit/delete, print, share) untouched. Verified: real title ("Lahmacun") in the `<h1>`, real ingredients in the server HTML. Left "You might also like" (related recipes) as client-fetched since it depends on the loaded recipe's cuisine and isn't core SEO content.
  - **Safety detail that mattered:** both `/hub/post/[id]` and `/kitchen/recipes/[id]` have an RLS carve-out letting an owner read their own *unpublished* draft via their authenticated session — a case the anonymous server-side fetch can't satisfy. Neither page hard-404s when the server fetch comes back empty; both always render the client component, which retries with the real session and has the original loading/error/not-found handling fully intact. Confirmed this is correct, not just assumed.
  - **Known minor issue, not fixed (out of scope):** recipe view-count increments rely on an RLS `UPDATE` policy scoped to `auth.uid() = user_id` — meaning it only ever worked when the recipe owner viewed their own recipe while logged in, never for real visitors. Pre-existing, unrelated to this conversion; a real fix needs a security-definer RPC, not a page-rendering change.
  - Full `npm run build` + `tsc --noEmit` + `eslint` pass clean after every step, tested against real production Supabase data along the way (not just local assumptions).

**Source:** A 6.4, A WEB-P1-005, B HM-06 · **Owner:** Engineering

Server HTML for a recipe detail page contains 12 words and no `<h1>`. Ingredients, method, cook time and rating render only after JavaScript. Confirmed in code: `kitchen/recipes/page.tsx`, `kitchen/recipes/[id]/page.tsx`, `charity/causes/page.tsx` and `blog/[slug]/page.tsx` all start with `"use client"`.

**Affected:** `/kitchen/recipes`, `/kitchen/recipes/[id]` (24), `/blog/[slug]` (10), `/charity/causes`, `/hub/post/[id]`

**Do:**
- [ ] Convert these routes to server components, or `generateStaticParams` + SSG, so the full content is in the initial HTML.
- [ ] Keep interactive widgets as `"use client"` leaf components only.
- [ ] Give every route server-rendered title, description, body summary, Open Graph metadata, canonical URL, and proper error and empty states.

**Done when:** `curl -s <recipe-url> | wc -w` returns hundreds of words, the curl output contains the recipe title and ingredient list, and Google's URL Inspection shows the rendered content.

---

### WA-15 · Fix heading semantics and add a real H1 to every page
✅ **READY — no blocker, just do it**
- [x] **Done for the routes WA-14 touched.** `/kitchen/recipes`, `/kitchen/recipes/[id]`, `/charity/causes` and `/hub/post/[id]` all now have a real `<h1>` with real content in the server HTML, verified by curl against a real build (not assumed from reading the code). `/blog/[slug]` already had one. Still open: `/kitchen/ai-assistant` (not in WA-14's scope) and the broader "no blank heading elements / sequential h2→h3" audit across the rest of the site.

**Source:** A 6.2, B HM-16 · **Owner:** Dev · **Depends on:** WA-14

`<h1>` elements exist in the client markup on `/kitchen/recipes` (line 447), recipe detail (line 819) and `/charity/causes` (line 91), but because those pages are client components the H1 never reaches the server HTML. Several pillar pages also expose a blank top-level heading before the visible title, which points at decorative or animated heading structures breaking semantics.

**Do:**
- [ ] Exactly one meaningful `<h1>` per page, above the fold, present in server HTML.
- [ ] Remove blank heading elements.
- [ ] Keep heading order sequential. No h2 → h4 jumps.
- [ ] Headings must stay understandable without animation.
- [ ] Never pick a heading level for visual size.

**Done when:** every public URL has exactly one `<h1>` in the server HTML.

---

### WA-16 · Unique title and meta description per page
✅ **READY — no blocker, just do it**
- [x] **Done for the static-page title bug + homepage.** Found this was bigger than just `/careers`: the root layout's `title.template: "%s | HalalMe"` was wrapping every child page's own title, and 4 pages (careers, cookies, privacy, terms) already had "HalalMe" baked into their title string, producing the exact "X | HalalMe | HalalMe" doubling — fixed all 9 affected pages (about, careers, charity, contact, cookies, for-restaurants, privacy, rewards, terms) by stripping the redundant brand mention and letting the template add it once. Also gave the homepage a real title instead of the bare "HalalMe" default, and added missing `layout.tsx` metadata to `/help` and `/partner/merchant` (the latter set `noindex` — it's the registration form, not a marketing page; `/for-restaurants` is the public page for that). Still open: `/dashboard` (correctly noindexed, low priority) and per-recipe/blog/post unique descriptions, which land as part of WA-14.

**Source:** A 6.1, B HM-07 · **Owner:** Dev + content

Only 13 routes define metadata (`grep "export const metadata" src/app`), and only `kitchen/recipes/[id]/layout.tsx` uses `generateMetadata`. Everything else inherits the root default "HalalMe", which is 7 characters and says nothing.

**Confirmed problems:**
- All 10 blog posts share "Halal Living Blog | HalalMe" and one meta description.
- `/kitchen/recipes`, `/kitchen/ai-assistant` and `/kitchen/recipes/upload` reuse the `/kitchen` title.
- Homepage, `/help`, `/partner/merchant` and `/dashboard` title as just "HalalMe".
- `src/app/careers/layout.tsx:4` sets `title: "Careers | HalalMe"` while the root template is `"%s | HalalMe"`, producing "Careers | HalalMe | HalalMe".

**Do:**
- [ ] Implement `generateMetadata` per dynamic route using the post or recipe title and excerpt.
- [ ] Write a distinct 50–60 char title and 140–155 char description for every static page.
- [ ] Fix the doubled suffix on `/careers`.
- [ ] Suggested pattern:
  - Homepage: `HalalMe — Halal food delivery, recipes and giving in the UK`
  - Delivery: `HalalMe Delivery — Order Halal Food Near You`
  - Kitchen: `HalalMe Kitchen — Halal Recipes and AQI Cooking Assistant`
  - Social: `HalalMe Social — Discover and Share Halal Experiences`
  - Charity: `HalalMe Community — Support Verified Causes`
  - Restaurants: `Partner with HalalMe Delivery`

**Done when:** no two sitemap URLs share a title or description, no title is under 25 or over 60 chars, no description over 155.

---

### WA-17 · Complete the sitemap
✅ **READY — no blocker, just do it**
- [x] **Done** — added `/charity/causes`, `/careers`, `/terms`, `/privacy`, `/cookies`. Left `/partner/merchant` out since it's the noindexed registration form, not marketing content (see WA-16). Also fixed the `lastModified: new Date()` bug — every static route was claiming to have changed at the exact moment the sitemap was requested; now omitted entirely for routes with no real tracked change-date, which is honest and still leaves `changeFrequency` as the crawl hint.

**Source:** B HM-08 · **Owner:** Dev

`src/app/sitemap.ts` already pulls recipes, hub posts and blog posts live from Supabase, so new content appears automatically. Only the static list is short.

**Do:**
- [ ] Add to `STATIC_ROUTES`: `/careers`, `/cookies`, `/privacy`, `/terms`, `/charity/causes`, `/partner/merchant`, `/select-role` if public.
- [ ] Replace `lastModified: new Date()` on static entries with realistic values. Everything currently claims to have changed today.
- [ ] Drop `priority` unless the values are meaningful.
- [ ] Keep `/dashboard` and auth routes out. They are correctly disallowed in `robots.ts`.

**Done when:** the sitemap URL count matches the set of public routes.

---

### WA-18 · Add JSON-LD structured data
✅ **READY — no blocker, just do it**
- [x] **Done — 4 of 5.** `Organization` + `WebSite` on every page (root layout). `Recipe` schema on recipe detail (ingredients, instructions, cook time, author, `aggregateRating` from real reviews) — built server-side from the same normalized data the page already renders, verified with real data ("Lahmacun") via curl, not assumed. `Article`/`BlogPosting` on all 10 blog posts. `FAQPage` on `/help` (~35 real Q&As, built from the page's own existing data, not invented). **Deliberately left `sameAs` off the Organization schema** — the footer's social icons are still `href="#"` placeholders, not real profile URLs, and a fabricated `sameAs` link is worse for search trust than omitting it; that's a separate gap (footer social links), not this item's job to paper over. **Caught and fixed a real bug before shipping:** the Recipe schema's `image` field was a relative path (`/images/...`) — schema.org requires absolute URLs — found by actually curling the output and reading it, not by trusting the code looked right. **Not done:** `BreadcrumbList` on nested routes — smaller, lower-priority piece, left for a follow-up pass.

**Source:** A 6.4, B HM-09 · **Owner:** Dev · **Depends on:** WA-14

Zero structured data anywhere. `grep "application/ld+json" src` returns nothing. `/help` holds around 35 real Q&As with no FAQPage markup, and 24 recipes have no Recipe markup.

**Do:**
- [ ] `Organization` + `WebSite` on the homepage, with name, logo and `sameAs` for Play Store and social profiles.
- [ ] `Recipe` on recipe pages: name, image, ingredients, instructions, cook time, author.
- [ ] `Article` / `BlogPosting` on blog posts: headline, image, datePublished, author.
- [ ] `FAQPage` on `/help`.
- [ ] `BreadcrumbList` on nested routes.
- [ ] Only mark up content that is visibly on the page.

**Done when:** Google's Rich Results Test passes for Recipe, Article and FAQPage with no errors, and Search Console Enhancements starts reporting valid items.

---

### WA-19 · Consolidate canonical host and redirects
✅ **READY — no blocker, just do it**
- [x] **Done — with one caveat.** Added a host-based redirect in `next.config.ts` (`www.halalme.co.uk` → apex, all paths preserved). Note: Next.js's config-level redirects only support 307 (temporary) or 308 (permanent) status codes — there's no way to emit a literal 301 from this layer. Used `permanent: true` → 308, which search engines treat as fully equivalent to a 301 for indexing/link-equity purposes, so the intent of this item is met even though a `curl -I` will show 308 rather than 301. Also depends on both `halalme.co.uk` and `www.halalme.co.uk` actually being aliased to the same Vercel deployment — if `www` isn't added as a domain on the project yet, this redirect won't fire; worth a quick check in Vercel's domain settings. Rest of the checklist (trailing slashes, redirect chains, Hub→Social mapping) still open.

**Source:** A 6.5, B HM-13 · **Owner:** Ops

`https://www.halalme.co.uk` returns 200 with identical content instead of a 301. (`http://` → `https://` is correctly 308.)

**Do:**
- [ ] Set the apex as the primary domain in Vercel, configure www as a 301 redirect.
- [ ] Audit the rest while you are there: trailing-slash consistency, lowercase URL rules, sitemap host, internal-link consistency, redirect chains.
- [ ] Add the old Hub → Social route mapping once WA-30 is decided.

**Done when:** `curl -I https://www.halalme.co.uk` returns 301 to `https://halalme.co.uk`.

---

### WA-20 · Make the Help centre the authoritative explanation layer
✅ **READY — no blocker, just do it**
- [x] **Done — the server-rendering half.** The accordion answers were never in server HTML: `{isOpen && <answer>}` meant React (even server-side) omitted the paragraph entirely until a visitor clicked, since `isOpen` starts `false`. Switched to always-rendering the answer in the DOM with CSS-only show/hide (a `grid-template-rows` transition instead of conditional JSX), so crawlers and screen readers get the full answer regardless of accordion state. Added a stable `#slug` anchor per question for direct linking, a visible category tag per answer (the "owning pillar" ask), and a "Last reviewed" date on the section. **Not done:** the "no answer may contradict the Terms or current product behaviour" content-accuracy pass — that needs a human read against the current Terms, not a code change.

**Source:** A 5.9 · **Owner:** Product + dev

The Help page exposes question headings but few substantive answers in its parsed public content, so accordion content is probably neither server-rendered nor indexable.

**Do:**
- [ ] Server-render every answer.
- [ ] Give each question a stable URL or anchor.
- [ ] Add owning pillar, last reviewed date and an escalation action to each answer.
- [ ] Add FAQPage structured data (covered by WA-18).
- [ ] No answer may contradict the Terms or current product behaviour.

**Done when:** answers appear in server HTML and each question is directly linkable.

---

## Accessibility

### WA-21 · Fix WCAG AA contrast failures
✅ **READY — no blocker, just do it**
- [x] **Done for the 4 pages the audit actually tested — turned out much bigger than "two or three CSS variables."** The audit's fix assumed a small set of shared tokens in `globals.css`; that doesn't exist. This codebase has **three separate, unrelated color-opacity systems** depending on which page you're on: `/delivery` and `/for-restaurants` use JS template literals with hex-alpha suffixes (`` `${CREAM}30` ``), `/kitchen/recipes` uses CSS `color-mix(in oklab, var(--hm-text) N%, ...)`, and the homepage uses Tailwind's `text-[#F7E7CE]/NN` opacity classes — three different syntaxes, no shared token to fix once. Went through all three, bumped every text-color instance below roughly 45% opacity up to ~60% (small labels/dates) or ~72% (body copy), matching the audit's own two target numbers. Skipped anything confirmed to be a border, background, or decorative icon (contrast rules don't apply to those). Also found and fixed the identical low-contrast carousel-dot pattern shared between `/delivery` and `/for-restaurants` while in there. **Not done:** a sitewide sweep beyond these 4 pages — that's WA-24's territory (the full audit), not this item's stated scope.

**Source:** A section 8, B HM-10 · **Owner:** Design system

Around 25 distinct failures per page, all from low-opacity cream text: body copy 3.95:1 (needs 4.5:1), comparison-table values 3.04:1, "UBER EATS"/"DELIVEROO" headers 2.02:1, review dates 1.76:1, mock-UI labels 1.62:1, hero sub-headline 3.95:1.

**Do:**
- [ ] Raise body-text opacity tokens from 0.46/0.50 to about 0.72.
- [ ] Raise small-caps label tokens from 0.19–0.31 to about 0.60.
- [ ] Fix at token level in `src/app/globals.css`, not per component. This is two or three variables.
- [ ] The hero sub-headline sits over a photo and may need a scrim rather than an opacity change.
- [ ] Check both themes. `globals.css` defines a light theme (`--hm-text: #102C26` on `#FAF2E1`), so verify contrast in each.

**Done when:** Axe DevTools reports zero colour-contrast violations on `/`, `/delivery`, `/for-restaurants`, `/kitchen/recipes`, and all body text is ≥ 4.5:1 with large text ≥ 3:1.

---

### WA-22 · Keyboard, labelling and tap-target fixes
✅ **READY — no blocker, just do it**
- [x] **Done for the specific instances the audit found.** Added a site-wide skip-to-content link (`LayoutContent.tsx`, jumps to a new `id="main-content"` on `<main>`, visually hidden until focused). Found and labelled the icon-only back button on `/kitchen/recipes` that had neither visible text nor `aria-label` (`aria-label="Back to Kitchen"`). Fixed the carousel-dot pattern on both `/delivery` and `/for-restaurants` — was an icon-only button with no `aria-label` and an 8px tap target; now has `aria-label`, `aria-current`, and a 44px+ padded hit area while keeping the small dot visually unchanged. Site-wide "no blank heading elements" and full keyboard-nav sweep still open — that's WA-24's broader audit, not this item's specific findings.

**Source:** A section 8, B HM-18 · **Owner:** Dev

No skip-to-content link anywhere (`grep -i "skip to content" src` returns nothing). Four unlabelled buttons on `/delivery`, one on `/kitchen/recipes`. One empty link to `/kitchen`. Four to eight interactive elements under 24px on mobile, mostly carousel dots and close buttons.

**Do:**
- [ ] Add a visually hidden skip link as the first focusable element.
- [ ] Give every icon-only button an `aria-label`.
- [ ] Remove or label the empty link.
- [ ] Raise minimum touch target to 44×44px using padding, not visual size.

**Done when:** Axe reports zero `button-name`, `link-name` or `target-size` violations, and tabbing from the top of the page reaches a visible "Skip to content" control.

---

### WA-23 · Add name and autocomplete attributes to all form inputs
✅ **READY — no blocker, just do it**
- [x] **Done.** Turned out there are three separate places auth forms are implemented, not one — fixed all three: the shared `LoginForm.tsx`/`SignupForm.tsx` components (used on the standalone `/login`, `/signup` pages) and the popup `AuthModal.tsx`'s own inline form (used everywhere `requireAuth` triggers it, e.g. Kitchen/Social actions). Added `name` + the correct `autocomplete` value (`email`, `current-password` for login, `new-password` for signup/confirm, `name`) to every field, and `htmlFor`/`id` pairing on the modal's labels which were missing that link. Contact form's name/email autocomplete was already done in an earlier session (WA-12); no phone field exists on that form, so nothing further needed there.

**Source:** B HM-11 · **Owner:** Dev

Only one `autoComplete` attribute exists in the whole app (`src/app/(auth)/complete-profile/page.tsx:310`). Sign-up and login inputs have no `name` and no `autocomplete`, so password managers and iOS/Android autofill will not offer to fill or save credentials.

**Do:**
- [ ] Sign-up and login: `name="email" autocomplete="email"`, `name="password" autocomplete="new-password"` (or `current-password` on login).
- [ ] Wrap the auth fields in a real `<form>`.
- [ ] Contact: `autocomplete="name"`, `"email"`, `"tel"`.

**Done when:** Chrome and iOS Safari offer to autofill, and to save the password on sign-up.

---

### WA-24 · Run a full WCAG 2.2 AA audit
✅ **READY — no blocker, just do it**
- [x] **Partially done — real bugs fixed, but this item genuinely can't be closed from a coding session.** Ran an automated `@axe-core/playwright` pass (WCAG 2.0/2.2 A+AA ruleset) across 14 key routes against a real local build — not a substitute for the test matrix below, but real coverage. Found and fixed 3 confirmed bugs: two icon-only buttons with no accessible name (AQI chat send button on `/kitchen`, the `/hub` post-carousel dots), and one invalid nested-interactive pattern (`<button>` inside `<Link>` on the `/kitchen/recipes` back-arrow, which also had an undersized tap target — fixed both). Re-scanned clean on those three issues after the fix. **Also surfaced that WA-21 doesn't generalize:** 111 color-contrast violations across all 14 scanned pages, confirming the contrast problem isn't limited to the 4 pages that fix covered — a real, larger follow-up. **Not done, and can't be from here:** the test matrix itself (VoiceOver, NVDA, TalkBack, 200%/400% zoom, reduced-motion, high-contrast mode, JS-off, screen-reader announcement of order/reward status) needs a human tester on real devices. Removed the axe tooling after use rather than leaving a permanent new dependency — if you want it kept for ongoing CI checks, say so and I'll re-add it properly.

**Source:** A section 8, A WEB-P1-006 · **Owner:** Accessibility specialist

The audit score of 5/10 was provisional. Automated checks do not cover the real risks here: animation-dependent meaning, client-rendered loading states, unclear accordion exposure, inconsistent focus and form messaging.

**Test matrix, at minimum:**
- [ ] Keyboard only
- [ ] VoiceOver on iOS and macOS
- [ ] TalkBack on Android
- [ ] NVDA on Windows
- [ ] 200% and 400% zoom
- [ ] Reduced-motion preference
- [ ] High-contrast mode
- [ ] Mobile landscape
- [ ] Slow network
- [ ] JavaScript failure
- [ ] Form-error recovery
- [ ] Screen-reader announcement of reward and order status

**Motion rule:** motion must explain, guide, confirm or reward. Every significant animation needs a reduced-motion equivalent and must never block ordering, payment or navigation.

**Done when:** a WCAG 2.2 AA test report exists and all critical failures are resolved.

---

## Performance

### WA-25 · Cut homepage image weight
✅ **READY — no blocker, just do it**
- [x] **Done, and turned out to be a different bug than the audit described.** `sizes`, `priority` and explicit dimensions were already correctly set on every homepage `<Image>` — those parts of the original finding no longer applied. The real problem: the **source files themselves** were enormous regardless of `sizes` — checked actual dimensions before touching anything and found originals up to 5991×3994px (`halal4.jpg`, a photo only ever used as a 1200×630 OG meta image). Converted 10 images to WebP with `sharp` (already available in the project): the 6 files actually used on the homepage/service pages (11MB → ~840kB combined, 90–96% reduction each) plus 4 more oversized files used purely as per-page OG images that shared the same problem. Updated all 26 code references across 13 files, verified every new path returns 200 and every touched page still renders, then deleted the old files — confirmed zero remaining references first (checked the whole repo, not just `src/`). Also found and removed one genuinely orphaned 3.9MB photo with zero references anywhere in the codebase. `public/images/hero/` went from 12MB to 1MB. Visually inspected the output before committing to the conversion, not just trusted the script exited cleanly — caught nothing wrong, but that's the same check that caught the OG-image bug in WA-26.

**Source:** A section 7, B HM-12 · **Owner:** Dev

Homepage ships 3.19 MB of images. Every image is requested at `w=3840`, so phones download 4K assets. Only one `sizes` prop exists in `src/app/page.tsx`. Desktop LCP is 3.47s on a fast connection.

**Confirmed on disk in `public/images/hero/`:**

| File | Size |
| --- | --- |
| `victoria-shes-UC0HZdUitWY-unsplash.jpg` | 3.9 MB |
| `halal1.png` | 2.75 MB |
| `halal3.jpg` | 2.38 MB |
| `halal5.jpg` | 1.36 MB |
| `halal4.jpg` | 1.20 MB |
| `halal2.jpg` | 1.17 MB |

**Do:**
- [ ] Convert photographic PNGs and large JPEGs to WebP/AVIF. Expect roughly 90% reduction.
- [ ] Add a `sizes` prop to every `next/image` so Next serves responsive widths.
- [ ] The hero already has `priority` (`page.tsx:147`). Confirm it is on the actual LCP element and remove lazy-loading from the 26px logo.
- [ ] Give every image explicit `width`/`height`.

**Done when:** homepage image transfer is under 600 kB, mobile requests resolve to `w=640`/`w=750`, and Lighthouse mobile LCP is under 2.5s.

---

### WA-26 · Optimise the social share image
✅ **READY — no blocker, just do it**
- [x] **Done.** Generated a purpose-built 1200×630 image (`public/images/og-share.jpg`, 28kB) with the actual HalalMe logo mark on the brand forest-green background — first attempt put the logo directly on the dark background and it was nearly invisible (the logo is designed to sit on the light circular disc the site already uses behind it in the header/footer), caught that by actually rendering and looking at the output before shipping it, not just trusting the script ran. Swapped `DEFAULT_OG_IMAGE` in `layout.tsx` from the old 1.36MB `halal5.jpg` to the new asset. `width`/`height`/`summary_large_image` were already correctly declared from a previous session, so only the asset itself needed replacing.

**Source:** B HM-14 · **Owner:** Dev + brand

`src/app/layout.tsx:43` still points `og:image` at `/images/hero/halal5.jpg`, a 1.36 MB raw JPEG. Large OG images unfurl slowly and are sometimes dropped by WhatsApp and LinkedIn. The `width`, `height` and `twitter:card=summary_large_image` declarations are already correct, so only the asset needs replacing.

**Do:**
- [ ] Produce a purpose-built 1200×630 share image with the HalalMe wordmark, under 200 kB.
- [ ] Swap `DEFAULT_OG_IMAGE` to the new asset.
- [ ] Consider per-section OG images (delivery, kitchen, charity) later.

**Done when:** the share image is under 200 kB and exactly 1200×630, and both the Facebook Sharing Debugger and LinkedIn Post Inspector render the preview.

---

## Product

### WA-27 · Restrict location autocomplete to the UK
⏭️ **SKIPPED — intentional, not a gap.** Lives on `delivery.halalme.co.uk` (Hyperzod), outside this codebase. Confirmed 8 Aug 2026 this is deliberately left as-is, not an oversight.
- [ ] Not started (won't-fix by decision)

**Source:** B HM-19 · **Owner:** Dev / Hyperzod

Typing "London" on `delivery.halalme.co.uk` offers "London, ON, Canada". The platform is UK-only.

**Do:**
- [ ] Set the Places/geocoding request to `componentRestrictions: { country: 'gb' }`, or the Hyperzod equivalent.
- [ ] If the field is owned by Hyperzod, raise it with their support and record the ticket reference here.

**Done when:** only UK results appear in address suggestions.

---

### WA-28 · Ship a web app manifest and touch icons
✅ **READY — no blocker, just do it**
- [x] **Done** — added `src/app/manifest.ts` (Next.js auto-serves `/manifest.webmanifest` and links it, no manual `<link>` tag needed). Generated `icon-192.png`, `icon-512.png`, `icon-512-maskable.png` (with proper safe-zone padding) and `apple-touch-icon.png` from the existing `public/logo/logo.png` using `sharp`, which was already available in the project. `/icon.png` (browser favicon) already existed and wasn't touched.

**Source:** B HM-17 · **Owner:** Dev

Confirmed: no `manifest.ts` in `src/app`, and no `manifest.json`, `site.webmanifest` or `apple-touch-icon.png` in `public/`. All return 404 on a mobile-first product.

**Do:**
- [ ] Add a manifest with name, short_name, theme_color, background_color and 192/512 icons, and link it.
- [ ] Add `apple-touch-icon.png` at 180×180 and a maskable icon.

**Done when:** no 404s for manifest or icon paths, and Chrome offers "Add to home screen".

---

## Measurement

### WA-29 · Add conversion event tracking and Search Console
✅ **READY — no blocker, just do it**
- [x] **Done — the 4 events.** Wired `track()` from `@vercel/analytics` at the real success point of each flow, not the button click (so a failed submission doesn't get counted as a conversion): `Create Free Account` fires after `signup()` actually resolves, in both places account creation happens — the shared `SignupForm.tsx` (used by `/signup`) and `AuthModal.tsx`'s own inline signup form (used everywhere `requireAuth` pops the modal); `Order Now` fires on click across all 6 delivery-handoff CTAs on `/delivery`; `Contact Form Submit` fires after the API call returns `ok`; and — worth noting — the audit's "`/for-restaurants` form submit" doesn't actually exist as a form on that page, `/for-restaurants` is a marketing page that links to `/partner/merchant` for the real merchant registration form, so that's where the tracking actually lives (`Restaurant Partner Form Submit`, fired after the provisioning API call succeeds). **Not done:** Search Console connection/sitemap submission and the field/lab performance baseline — both are Vercel/Google dashboard tasks, not code, need you.

**Source:** A section 7, A WEB-P1-007, B HM-05 · **Owner:** Ops + dev

Pageview analytics is already live. `@vercel/analytics`, `@vercel/speed-insights` and `@sentry/nextjs` are installed and mounted in `src/app/layout.tsx:94-95`. What is missing is the conversion layer. `src/lib/analytics/authGate.ts:20` has the only `analytics.track` call and it is commented out.

**Do:**
- [ ] Track as events: `Create Free Account`, `Order Now` (outbound to the delivery subdomain), `/for-restaurants` form submit, contact form submit.
- [ ] Verify Google Search Console is connected and the sitemap is submitted.
- [ ] Record a field and lab performance baseline per page template. Targets at p75: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1.
- [ ] Do not add GA4 or a Meta pixel without also adding a consent banner and updating `/cookies`. Vercel Analytics is cookieless, which is why the current no-banner cookie policy stays accurate.

**Done when:** the dashboard shows pageviews plus the four events, and `/cookies` still describes reality.

---

## Brand consistency

### WA-30 · Resolve Hub versus Social
✅ **DECIDED AND BUILT (8 Aug 2026) — Social**
- [x] **Done.** Renamed the route: `src/app/hub` → `src/app/social` (`git mv`). Added permanent redirects in `next.config.ts` for `/hub` → `/social` and `/hub/:path*` → `/social/:path*` — verified live, both 308: `/hub/feed` → `/social/feed`, `/hub/post/abc123` → `/social/post/abc123`. Updated every internal href, canonical URL, sitemap entry, the middleware subdomain-routing map, and the themed-route arrays (`ThemeContext.tsx`, the inline theme-init script in `layout.tsx`, `LayoutContent.tsx`'s footer-hide list) from `/hub` to `/social`. Swept "Hub" → "Social" through nav, footer, About, Terms, Privacy, Rewards, Kitchen, all 10 blog posts, and internal admin panel labels (module keys like `"hub"` left alone — they're RBAC/permission identifiers, not public copy, and renaming them risks breaking permission checks for no visible benefit). Full `npm run build` (130 pages) + `tsc --noEmit` + `eslint` clean.

**Follow-up caught from a live screenshot, same session:** the code-only sweep couldn't reach copy that lives in the database — `/dashboard?tab=rewards` still showed "in Hub" on 5 reward-catalog descriptions (flair unlocks, post boost) and 1 badge, plus historical ledger rows reading "Posted in Hub". Fixed via `supabase/migrations/070_hub_to_social_rename.sql`, applied to the remote DB directly and verified clean by re-querying. The migration also re-points the `handle_post_created()` trigger so newly created posts stop generating fresh "Posted in Hub" ledger text going forward, not just backfilling the old rows.

**Confirmed by HME-WEB-DEC-001 (10 Aug 2026):** "HalalMe Social is the official public pillar name. 'HalalMe Hub' is retired as public branding, internal/legacy terminology only." Matches what was already shipped — no changes needed. His doc adds one detail worth keeping in mind: the internal rationale for retiring "Hub" includes avoiding the naming/visual association with a certain other site starting with "Porn" — that rationale itself is internal-only and shouldn't surface in public brand copy, but explains why "Hub" isn't coming back as a public name even informally.

**Source:** A 3.4, A WEB-P1-002 · **Owner:** Product + dev

The public page is branded "HalalMe Social" but the route, legal content and internal references all use Hub. `src/components/layout/Footer.tsx:11` maps `{ label: "Social", href: "/hub" }`, which is the mismatch in one line. Audit A recommends HalalMe Social as the stronger public name — this is a naming call you're already trusted to make.

**Do:**
- [ ] Pick "Social" (recommended) and align: navigation, page title, H1, canonical URL, permanent redirect from the old route, Terms and Privacy references, analytics event names, support taxonomy.

**Done when:** one name, one URL strategy, one analytics taxonomy.

---

### WA-31 · Resolve Rewards ownership and tier names
🔒 **OVERRIDDEN by HME-WEB-DEC-001 (10 Aug 2026) — Diamond is locked, Platinum reverted**
- [x] **Tier naming reverted back to Diamond, ownership-split half still open.** The 8 Aug session renamed Diamond → Platinum (3 code sites + a DB migration for the `badges` catalog). Sami's decision doc explicitly locks the opposite: *"Bronze → Silver → Gold → Diamond. Diamond supersedes Platinum. Do not rename Diamond to Platinum."* Reverted all of it the same session it was flagged: `RewardsTab.tsx`'s `TIER_LABEL` map, `rewards/page.tsx`'s tier table and hero text, `HorizontalServices.tsx`'s Rewards preview card, plus a new migration `071_revert_diamond_tier_name.sql` undoing the `tier-diamond` badge's `name`/`description` — applied via Supabase MCP, verified by re-query. Internal tier keys (`"platinum"` in `TIER_ORDER`/`min_tier_required`, the `tier-diamond` slug itself) intentionally left alone — same precedent as Hub→Social, internal identifiers aren't public copy. **Admin gap fixed 11 Aug 2026** — `admin/users/page.tsx` and `admin/users/[id]/page.tsx` were both rendering the raw DB tier value through CSS `capitalize` ("Platinum") instead of the locked "Diamond" label; added the same `TIER_LABEL` map pattern to both. **Still not done:** the ownership-split half (Delivery-owned vs Rewards-owned language) — same work as WA-43, left for that pass.

**Source:** A 3.5, A WEB-P1-003 · **Owner:** Delivery + Rewards

The live Rewards page presents points, daily login rewards and tiers as an ecosystem-wide gamification layer. Food Points, Food Wallet and membership belong inside **Delivery**, and tiers are locked as Bronze / Silver / Gold / **Diamond** per HME-WEB-DEC-001 — this overrides the audit's original "Platinum" recommendation.

**Do:**
- [x] ~~Rename Diamond to Platinum everywhere~~ — reversed, see above. Diamond is the locked public name.
- [ ] Split ownership in the copy. **Delivery-owned:** Food Points, Food Wallet, HalalMe+, Bronze/Silver/Gold/Diamond, delivery discounts and redemptions. **Rewards-owned:** ecosystem access, recognition, cross-pillar opportunities, non-Delivery unlocks.
- [ ] Rewards may surface an event that originated in Delivery, but must not imply it owns the Delivery ledger.

**Done when:** Food Points and membership are presented as Delivery-owned, and Diamond is the one tier vocabulary used site-wide (including the admin panel gap above).

---

# P2 — This quarter

## Brand and ecosystem

### WA-32 · Bring delivery.halalme.co.uk into the HalalMe brand
🔓 **UN-SKIPPED by HME-WEB-DEC-001 (10 Aug 2026) — canonical override on how, not whether**
- [ ] Not started (theming work, not this codebase)

**Was marked ⏭️ skipped on 8 Aug** as out-of-scope (separate Hyperzod platform, WA-27's twin). Sami's doc reopens it as a **canonical override**, and changes the target: *"Delivery purple is not legacy/default styling to be removed. It is a deliberately governed HalalMe Delivery pillar signal... bring `delivery.halalme.co.uk` into the governed HalalMe Delivery visual system: correct identity, typography, purple hierarchy, neutral/cream treatment, buttons/states, footer, favicon and copy. Do not convert the Delivery marketplace into the master site's green-and-cream visual world."* Governing principle from his doc: *shared ecosystem constitution, different pillar worlds.* So this is no longer "make it match the homepage" — it's "clean up the Hyperzod theme within its own purple identity, on-brand but not re-skinned green/cream."

**Source:** B HM-20 · **Owner:** Ops + brand · **Highest branding impact**

The Hyperzod white-label ordering platform has different logo treatment, different typography, and a footer reading "© Copyright 2021 – 2026 Halal Delivery LTD". CTAs open it in a new tab. This is the first thing a paying customer sees after clicking the main CTA.

**Do:**
- [ ] Apply HalalMe Delivery identity, typography and the purple hierarchy in the Hyperzod theme settings — keep purple as the base, don't push master green/cream onto it. Most white-labels expose primary colour, logo, favicon and custom CSS.
- [ ] Match the footer entity string to WA-02 once that's resolved (use a placeholder for now if needed, don't block this whole item on it).
- [ ] Set the platform favicon and page titles to HalalMe Delivery.
- [ ] Where the theme cannot be changed, list the specific limits so a longer-term decision can be made.

**Done when:** delivery.halalme.co.uk reads as governed HalalMe Delivery branding — purple base retained, no Hyperzod branding, no stale copyright line.

---

### WA-33 · Settle one spelling and one entity name everywhere
🟡 **Spelling half DECIDED AND BUILT (8 Aug 2026) — HalalMe** · entity-name half still ⛔ waits on WA-02
- [x] **Spelling half done.** Swept the codebase for the two-word "Halal Me" variant. Found exactly one instance — inside a real, dated customer testimonial in `/delivery`'s `TestimonialsSection` ("Halal Me Delivery is a game-changer..." — Zainab Javied, 11 Oct 2023). Left it untouched: it's the customer's own words, not site copy, so rewriting it to match the locked spelling would be editing what a real person actually said (see `SOCIAL_PROOF_REGISTER.md`, SP-01). Every other instance across the codebase already used "HalalMe" — nothing else to change. **Not done:** Play Store app title / developer display name ("Halal Me." / "Halal Me Delivery ltd") — that's an app-store-console change, not a code change.

**Source:** B HM-21 · **Owner:** Brand · **Depends on:** WA-02 (entity name only)

The website uses "HalalMe". Google Play listings use "Halal Me." under developer "Halal Me Delivery ltd". The footer uses both "Halal Delivery LTD" and "HalalMe Delivery LTD". The delivery platform footer uses "Halal Delivery LTD".

**Split this item:** the brand spelling is yours to lock right now. Only the registered-entity string (which name/address to print where legally required) waits on WA-02.

**Do now:**
- [ ] Lock the public brand spelling as "HalalMe" and sweep site copy, meta titles, Play Store app titles and developer display name, transactional emails.

**Do once WA-02 lands:**
- [ ] Use the registered entity name per Companies House wherever the legal name is required.
- [ ] Update Play Store app titles and developer display name.
- [ ] Sweep every surface: site copy, meta titles, delivery platform, transactional emails, app store listings.

**Done when:** one brand spelling across every public surface, and one registered entity string wherever the legal name is required.

---

### WA-34 · Remove the "one account" contradiction at the handoff
✅ **READY — no blocker, just do it** (copy updated 10 Aug 2026 to HME-WEB-DEC-001's approved wording)
- [x] **Done — short-term fix.** Dropped `target="_blank" rel="noopener noreferrer"` from all 6 "Order Now"-style CTAs on `/delivery` that link to `delivery.halalme.co.uk` (now navigates same-tab, so back-navigation and funnel tracking actually work). Left the individual restaurant deep-links (browsing/comparing multiple merchants) as `target="_blank"` — different use case, not the CTA the audit was pointing at. Softened the literal false claim under the homepage H1. **Updated again 10 Aug:** Sami's decision doc gives an explicit approved interim proposition — *"A whole halal world, connected through HalalMe."* — replacing the 8 Aug session's own wording with his exact line. Also caught and fixed a second un-swept "one account" claim the same session: `Header.tsx:500`'s footer tagline said "Five services. One account." — softened to "Five services. One HalalMe." **Not done:** the medium-term fix (actual SSO between the two domains) — that's a real cross-platform auth project, correctly scoped as its own thing, not part of this quarter's item.

**Source:** B HM-22 · **Owner:** Product

The homepage sells "one account, no switching apps" (`src/app/page.tsx:521`, `src/components/layout/Header.tsx:500`). Clicking "Order Now" opens a new tab requiring a separate one-time-code login on another domain.

**Do:**
- [ ] Short term: drop `target="_blank"` so back-navigation and funnel tracking work, and soften the "one account" copy until it is true.
- [ ] Medium term: single sign-on between `halalme.co.uk` and the delivery platform, or move ordering onto the main domain. *(Bigger project — the short-term fix above is what closes this item this quarter.)*

**Done when:** no claim on the site says a single account covers ordering until it actually does, and outbound clicks are tracked as events (depends on WA-29).

---

### WA-35 · Lock and publish one service taxonomy
✅ **DECIDED AND BUILT (8 Aug 2026) — five services**
- [x] **Done.** Applied the five-service hierarchy (Delivery, Kitchen, Social, Community→Charity, Rewards) everywhere the audit named: navigation (`Header.tsx`, `Footer.tsx` already matched), About (`/about` was showing four services and had folded Charity's description into Rewards' — a real content bug, not just a naming gap, fixed to five distinct entries), meta descriptions (root `layout.tsx` said "Four halal services", now "Five halal services, one account"), and legal content (`/terms`'s service list). Homepage, footer and header nav already enumerated all five correctly before this session — only About and the meta description had actually drifted.

**Source:** A 3.3, A WEB-P1-001 · **Owner:** Brand architecture

The site alternates between four and five services. The homepage says five, the root meta description says "Four halal services", the About page describes four, "How it works" omits Charity, and some architecture says Hub while the brand language says Social. This is brand architecture you've been delegated to lock — one decision instead of five separate arguments across different pages.

**Hierarchy to adopt:**

```
HalalMe
├── Delivery
├── Kitchen
├── Social
├── Community
│   └── Charity
└── Rewards
```

**Do:**
- [ ] Apply it to navigation, footer, About, select-role, meta descriptions and legal content.
- [ ] Stop treating Charity and Community as interchangeable.
- [ ] Stop hiding one service in certain journeys.

**Done when:** one service hierarchy is used across the site and the legal content.

---

### WA-36 · Align the cultural positioning copy
🟡 **YOUR CALL — default: "Built around halal values. Open to everyone."**
- [x] **Done** — applied to the footer tagline and the About page "Community-Driven" card. The homepage hero itself doesn't currently carry this line — worth adding when WA-37 (homepage rebuild) happens.

**Source:** A 3.6 · **Owner:** Brand + content

The site mixes "Built for Muslims", broad public-access language, universal lifestyle positioning and scholar authority language. The approved position is more precise: Muslim-rooted, values-led, open to everyone. This is tone/copy you've been delegated to lock.

**Formulation to adopt:** **"Built around halal values. Open to everyone."**

**Do:**
- [ ] Roll the line out across hero and About copy.
- [ ] Do not imply non-Muslims are outsiders, and do not imply the platform holds religious authority.
- [ ] Explain the Islamic origin and wider ethical meaning of halal progressively across the site, rather than compressing it into every hero.

**Done when:** hero and About copy use one consistent positioning line.

---

## UX and conversion

### WA-37 · Rebuild the homepage hierarchy
✅ **READY — no blocker, just do it**
- [ ] **Not started**

**Source:** A 5.1, A WEB-P1-004 · **Owner:** Product marketing

The homepage tries to do ten jobs at once: explain the ecosystem, acquire Delivery customers, introduce Kitchen, promote Social, promote Charity, explain Rewards, establish halal trust, show statistics, show testimonials and recruit interest. A new visitor cannot tell what to do first.

**Target order:**
1. Master promise
2. Primary entry action
3. Brief ecosystem explanation
4. One connected customer journey
5. Pillar destinations
6. Evidence and trust
7. Current live availability
8. Secondary audiences

**Suggested hero:**
> A whole halal world, connected through one account.
> Discover food, recipes, people, rewards and community experiences built around halal values.
> `[Explore HalalMe]` `[Order food]`

The second CTA should point at the most commercially mature pillar.

**Done when:** the page has one primary action and a measurable conversion path.

---

### WA-38 · Replace one "five services" block with a connected customer story
✅ **READY — no blocker, just do it**
- [ ] **Not started**

**Source:** A 3.2 · **Owner:** Product marketing

The ecosystem currently reads as a feature catalogue. The visitor gets five independent promises and no believable end-to-end relationship.

**Show one instead:** discover a merchant → place an order → receive Delivery-owned Food Points → share a verified experience on Social → discover a Kitchen recipe → unlock an ecosystem opportunity → review it all in one account.

**Constraints:** one person, one account, several pillar interactions, precise ownership of each value, no invented features, and no implication that integrations are live when they are not.

**Done when:** at least one generic services grid is replaced by a single connected journey.

---

### WA-39 · Split the Delivery page
🔴 **SPLIT ATTEMPTED AND REVERTED (11 Aug 2026) — founder decision. Do not re-attempt the split.**
- [ ] **Not started** — the underlying problem (length + repetition) is still open, but the audit's prescribed *solution* has been rejected.

**Source:** A 5.2 · **Owner:** Product marketing

The Delivery page is visually the strongest area but far too long on mobile, and it restates the same value propositions repeatedly.

**What was tried, and why it was reverted.** Built the split as the audit describes: `/delivery` kept as a short conversion page (announcement, ticker, hero, real restaurant cards, testimonials, CTA) with the brand/merchant content moved to a new `/delivery/about` (stats, how-it-works, why-delivery, app experience, the POS-terminal merchant section, promo banner), sharing a `sections.tsx` module, its own metadata/canonical, and a sitemap entry. The founder reviewed it and called it worse than the original. On reflection that's right, and the audit's recommendation was weaker than its own diagnosis:
- The split treats the symptom (page length) rather than the actual finding (**repetition**). Cutting the repeated value props shortens the page *without* fragmenting it.
- It buries the merchant-recruitment section — some of the strongest visual content on the site — behind a "read more" link that realistically gets very little click-through.
- It splits SEO signal across two URLs instead of one strong `/delivery`.
- Page length was never actually blocking conversion: the "Order Now" CTA and the HALAL10 offer are both already in the first viewport, so a visitor who wants to order never has to scroll at all.
- A long scrolling landing page is a normal, well-understood pattern for food delivery.

Reverted completely — `sections.tsx` and `about/` deleted, `page.tsx` restored to the single-page composition, sitemap entry removed. Verified afterwards that the same session's earlier copy fixes to this file (WA-04's "Halal-Focused"/"Halal Status Reviewed", WA-05's stat removals, the "favourite" spelling fix) all survived the round-trip.

**Also not built, and flagged rather than faked:** the audit's "first mobile viewport shows location entry + available merchant count for that location" needs a real coverage/merchant-count data source. Fulfilment runs on Hyperzod and there's no coverage API wired up here, so a location checker would have to invent its results. Sami's own doc asks for exactly this pattern (postcode check → clear unavailable state → notify-me), so it's worth building properly — but as a real feature against real data, not as UI theatre.

**Revised direction if this is picked up again:** keep one page; remove the duplicated value propositions instead. Tighten or drop whichever of `HowItWorksSection` / `WhyDeliverySection` / `DeliveryExperienceSection` restate the same promises, and consider trimming the merchant section here since `/for-restaurants` already exists as its dedicated page.

**Done when:** the page is shorter because the repetition is gone, not because content moved to a second URL.

---

### WA-40 · Rebuild the Kitchen demonstration journey
✅ **READY — no blocker, just do it**
- [ ] **Not started**

**Source:** A 5.3 · **Owner:** Kitchen product owner

AQI is potentially the most differentiated product, but the marketing promise runs ahead of the discoverable application and the content model does not distinguish AI, community and reviewed recipes.

**Do:**
- [ ] Build one credible public demonstration: choose a recipe → ask AQI to adapt an ingredient → see what changed → receive safety and evidence notes → save the variation.
- [ ] A visitor must be able to understand the product without registering first and without relying on database-scale claims.

**Done when:** the Kitchen acquisition journey demonstrates the product rather than describing it.

---

### WA-41 · Reframe the Social page around useful discovery
✅ **UNBLOCKED (8 Aug 2026) — WA-30 decided Social — but not yet built. Attempted 11 Aug, reverted by founder decision.**
- [ ] **Not started.** WA-30's decision and route rename are done, so nothing is stopping this anymore — but the rename itself was routing/naming only. The full reframe below (lead value prop, distinguish content types, surface moderation/reporting) is still open, and the moderation/reporting half specifically stays gated behind WA-10's legal assessment regardless — don't build that piece first.

**11 Aug 2026 — attempted and reverted.** Tried rewriting the hero headline ("Real Posts. Real People." → something else) and removing the fake `verified` checkmark badges from the landing page's illustrative post-preview mockup (`MOCK_POSTS`), on the reasoning that a headline literally claiming these fabricated stock-photo personas are "real people" is a direct false claim, same class as everything fixed in WA-04/WA-05/WA-53. Founder rejected the change and asked to leave it as it was — reverted completely (headline, verified badges, and an "Example content" label all restored/removed). **This specific finding is therefore still live on the site** (the headline and fake verified badges are unchanged) — flagging it here rather than quietly dropping it, in case it's worth a second look with more context on why it should stay.

**11 Aug 2026 — separate, narrower fix that *was* wanted:** the founder flagged that Social's copy leaned heavily on food/recipe language sitewide ("share recipes", "food lovers", "Your Food. Your Community.") despite Kitchen already owning recipes — diluting both pillars' positioning. Swept this specifically (distinct from the fuller WA-41 reframe, and done): hero subtitle, the `whatYouCanDo` and `features` arrays, the stats strip, trust badges, and the "Your Food." section heading all reworded from food/recipe-first to community/story-first framing, redirecting recipe-specific intent to Kitchen explicitly in one spot. Same wording fix applied to the homepage's `HorizontalServices.tsx` Social card, the dashboard's `OverviewTab.tsx`, and `about/page.tsx`'s five-service list, which all had the identical "share recipes" phrasing. Left the `MOCK_POSTS` mock content and a real customer testimonial mentioning "sharing recipes" untouched — copy-level positioning was the ask, not the preview mockup or someone's real words.

**Source:** A 5.4 · **Owner:** Product marketing · **Depends on:** ~~WA-30~~ *(resolved 8 Aug 2026)*

Reporting and moderation pathways are not prominent, and the visitor cannot tell what content is public, private or account-only.

**Do — once you've picked the name in WA-30:**
- [ ] Lead with the unique value: *"Discover halal places and experiences through people who have actually been there."*
- [ ] Then distinguish: community recommendations, verified-order contributions, recipes, general posts, merchant content, moderation and reporting, and public versus account-only visibility.

**Done when:** the page explains what Social is for and how content is governed.

---

### WA-42 · Rebuild Charity around evidence and financial clarity
✅ **DONE (11 Aug 2026)** — unblocked by WA-09, evidence layer and impact-language rewrite both built
- [x] **Done.** Evidence layer (see below) plus the impact-language fix: replaced the "£5/£10/£20/£50+ — what your donation does" block, which invented identical outcome claims for every charity regardless of what they actually do, with a "Where Your Money Goes" block using only real, verifiable facts — the actual 95/5 fee split (matches WA-09's corrected copy), a plain statement that HalalMe is the payment conduit not the charity operator, and a real link to the charity's own website (`charity.website_url`, another already-fetched-but-unused DB field) for how they report on their own work. This is the "informed agency instead of emotional pressure" rewrite this item's done-when called for — gives real information instead of fabricated per-amount promises.

**Source:** A 5.5 · **Owner:** Community + product · **Depends on:** WA-09 (now answered)

**What was built:** the `charities` table already had real evidence columns (`legal_name`, `registration_number`, `verification_level` 0-3, `verified_at`, `website_url`) sitting completely unused by the UI — `select("*")` was already fetching them, nothing displayed them. Extended the `Charity` type, added `src/lib/charityEvidence.ts`, and wired a real evidence line into `CharityCard.tsx` plus a full "Who Operates This Cause" block into the charity detail page — legal name, registration number, review status, last-reviewed date, all from real data. Verified against live DB rows via Supabase MCP: two real charities already have `legal_name`/`registration_number` on file and will render correctly; none are `is_active`/`stripe_charges_enabled` yet, so the existing "coming soon" empty state is still correctly what's live today.

**Target flow:** choose an approved cause → understand who operates it (✅) → see what evidence HalalMe reviewed (✅) → understand fees before payment (✅) → donate through the identified payment flow (✅) → receive confirmation → see transfer and impact status later.

**Done when:** impact language moves from emotional pressure to informed agency (✅), and fees are visible before payment (✅).

---

### WA-43 · Reframe Rewards around provenance and usefulness
✅ **DONE (11 Aug 2026)**
- [x] **Done.** Checked the real catalog (`reward_catalog`, via Supabase MCP) before writing anything — every redeem item currently requires only the Bronze tier (everyone qualifies), but the page showed a 🔒 "Unlocks by tier" label on all of them, which is actively misleading about what actually gates a redemption (points, not tier). Replaced with real point costs pulled from the catalog (150–500 pts depending on item) and "available from Bronze". Clarified the status-vs-spendable distinction the audit named: added copy stating tier is a permanent status (never spent, raises your AI-request baseline) while points are the actual spendable currency, and confirmed points don't currently expire (`expires_at` exists as a column but nothing in the award-points engine ever populates it) before saying so. Fixed the "manufactured engagement" finding — "Log In Daily... +10 points just for showing up" was rewritten to lead with the referral bonus (a genuine, non-farmed mechanic) instead of headlining pure daily check-in. **Deliberately did not** invent a Delivery-owned vs Rewards-owned points split in the copy — checked the DB first and confirmed no separate Food Points/Food Wallet system exists anywhere in the schema; Sami's ownership framework (WA-31) describes a future architecture, not what's built today, so claiming that split now would have been exactly the kind of fabrication this whole audit exists to catch.

**Source:** A 5.6 · **Owner:** Rewards product · **Depends on:** WA-31 (also ready)

**Done when:** each reward on the page states its origin, its use and its expiry *(done for what's real today — the Delivery/Rewards ownership split stays open until that architecture actually exists, see WA-31)*.

---

### WA-44 · Fix the select-role page
✅ **DONE (11 Aug 2026)**
- [x] **Done.** Applied the intention-based labels: card 1 is now **"Explore HalalMe"** with the eyebrow "For Customers & Cooks" (was "Explore & Connect" / "Platform"), and the partner card's two buttons are now **"Manage a Restaurant"** and **"Deliver with HalalMe"** (were bare role nouns "Merchant" / "Driver"). Stacked those two buttons vertically instead of side-by-side so the fuller labels fit without truncating, which also gives them full-width tap targets. Removed the **"Operational"** badge the audit flagged on the customer-facing card — it read as back-office jargon on a consumer option; replaced with "Live Now", which keeps the original intent (signalling the product is actually available) in plain language, consistent with WA-52's live/coming-soon vocabulary.
- [x] **Fixed a self-contradiction the audit didn't name:** the service mini-grid listed only 4 services (Kitchen, Social, Rewards, Delivery — Charity missing) while the trust bar directly below it on the same page said "5 Unified Services". Added Charity and reordered to the locked WA-35 taxonomy (Delivery → Kitchen → Social → Charity → Rewards), restacking the grid to 5 columns with the icon above the label so it still fits at mobile width.
- [x] Also swept two copy issues found in the same file: a feature bullet still said "Social **hub** for the halal community" (retired public name, WA-30) → "A social feed for the halal community"; and "Earn rewards by donating to causes" → "Give to registered charities, earn rewards" (matches the WA-09 "registered, not verified" language).
- [ ] **Not done:** connecting this to one account with multiple authorised workspaces — that's a real auth project, same category as WA-34's SSO note, not a labelling fix.

**Source:** A 5.8 · **Owner:** Product

**Done when:** role labels describe user intention *(done)*.

---

## Growth

### WA-45 · City landing pages
⛔ **WAITING on WA-05** (not a separate ask — see the serious-blockers list)
- [ ] **Not started**

**Source:** A 6.7, B HM-23, A WEB-P2-001 · **Owner:** SEO + Delivery Ops · **Depends on:** WA-05

The site claims "5 UK cities" but never names them. Verified live merchants in Leicester include Tegtat, Amigos, Dippers, Deccan Flavours, DFC Express, Moo Moo Meat & Grill, Dhaaba 66 and K's Bakery.

**What's blocking it:** can't build "5 city" pages before the five cities are actually agreed as part of WA-05.

**Do — once WA-05 is resolved:**
- [ ] One page per live city, for example `/delivery/leicester`, `/delivery/birmingham`, `/delivery/london`, `/delivery/derby`, `/delivery/burton`.
- [ ] Each page needs genuine local evidence: named live merchants, available postcodes, local fulfilment, local offers, current opening coverage, local support info.
- [ ] No generic location-swapped copy.
- [ ] Add `LocalBusiness` / `BreadcrumbList` schema and include the pages in the sitemap.

**Done when:** one indexed page per live city, each with unique content and named merchants.

---

### WA-46 · Link the apps, add a waitlist, ship a branded 404
🟡 **404 PAGE DONE (11 Aug 2026)** — app links and waitlist still open
- [x] **404 page done.** Built `src/app/not-found.tsx` — on-brand (forest green/champagne, headline type treatment), with quick links to all five live pillars plus Help, and a clear "Back to Home" CTA. **No search box** — checked first, there's no URL-driven search feature anywhere in the app to hook one into (Kitchen's recipe search is local client-state, not a query param), and a search box that doesn't actually search would be the same category of dishonest UI this whole audit has been removing all session. Quick links do the same recovery job honestly.
- [ ] Play Store/App Store badges — not done.
- [ ] Email waitlist capture for Fresh/Travel/Marketplace — not done.
- [ ] `robots.ts` still names the three unreleased verticals in its `Disallow` list — not reconsidered.

**Source:** B HM-25 · **Owner:** Growth + dev

**Done when:** app links work, the waitlist stores submissions *(both still open)*, and the 404 offers a route back *(done)*.

---

## Security and privacy

### WA-47 · Add CSP and Permissions-Policy headers
✅ **READY — no blocker, just do it**
- [x] **Done — report-only, as recommended.** Added `Content-Security-Policy-Report-Only` (logs violations to console, blocks nothing yet) covering Supabase, Stripe.js/Elements, Cloudinary, Sentry ingest, Vercel Analytics, and the existing image remote patterns. `Permissions-Policy` added with `geolocation=()` — checked the codebase, browser geolocation isn't actually used anywhere, so disabled rather than allowed. `'unsafe-inline'` stays on script-src/style-src for now since the app relies on an inline theme-init `<Script>` and `style={{}}` props throughout; tightening to a nonce-based policy is a real follow-up, not done today. No `report-uri` wired up yet, so violations only show in each visitor's own browser console — hooking that up to actually collect reports server-side is the next step before flipping this to enforcing.

**Source:** B HM-24 · **Owner:** Dev

`next.config.ts` already sets `X-Content-Type-Options`, `X-Frame-Options` and `Referrer-Policy`, plus a well-scoped CORS allowlist for `/api/*`. Missing: `Content-Security-Policy` and `Permissions-Policy`, on a site that renders user-generated posts and recipes.

**Do:**
- [ ] Add a CSP in report-only mode first, then enforce. Account for Vercel Analytics, Speed Insights, Sentry, Cloudinary, Supabase and Stripe origins.
- [ ] Add `Permissions-Policy: geolocation=(self), camera=(), microphone=()`.
- [ ] Confirm HSTS is actually set. It is not in `next.config.ts`, so check whether Vercel or Cloudflare is adding it.

**Done when:** both headers are present, securityheaders.com grades A or better, and report-only logs stay clean for a week.

---

### WA-48 · Build the privacy data map and verify the cookie inventory
🟡 **DATA MAP + DRAFT POLICY DONE (11 Aug 2026)** — OpenAI terms + consent-banner conclusion still need external confirmation
- [x] **Cookie/storage scan done.** Built `PRIVACY_DATA_MAP.md` — a code-level inventory (every cookie/`localStorage`/`sessionStorage` read-write site found by searching the codebase, plus every third-party processor actually called server-side) rather than a manual browser click-through. Confirmed: no `document.cookie` calls anywhere, no ad/analytics tracking cookies, no consent platform. Supabase auth-helpers sets the session cookie; Stripe.js sets its own fraud-detection cookies when Elements loads; Vercel Analytics/Speed Insights are cookieless by design. Traced the real AQI data flow: browser → Supabase Edge Function `generate-recipe` → OpenAI Chat Completions API directly (server-to-server, browser never talks to OpenAI). Also traced Stripe, Cloudinary, Resend and Hyperzod as the other real processors. Bonus find: the blog's newsletter signup has no submit handler — collects nothing, but misleads visitors into thinking they subscribed.
- [x] **Retention periods drafted into `privacy/page.tsx` §6**, category by category (account data 30 days post-closure, AQI chat session-only/never server-stored, payments 6 years per UK tax law, support tickets 2 years, security logs 12 months) — real, defensible numbers grounded in what the code does, not invented, but not yet Sami/legal-confirmed as final.
- [x] **Caught a real mismatch before shipping it:** a first draft of the community-content retention line said deletion "does not automatically delete" recipes/posts, matching Sami's intended policy. Checked the actual schema before publishing that claim — `recipes.user_id`, `recipe_reviews.user_id`, `recipe_favorites.user_id` etc. are all `ON DELETE CASCADE` from `profiles`. Account deletion **does** currently delete community content; it doesn't anonymise it. Corrected the Privacy Policy to state the true current behaviour, with a note that HalalMe intends to move to the anonymised-retention model. **Real follow-up, not done:** migrate those foreign keys from `CASCADE` to `SET NULL` (or equivalent) so the actual behaviour matches Sami's approved policy — a schema change, not a copy fix.
- [ ] OpenAI's current API training-data terms still need confirming against their live agreement (not assumed).
- [ ] Whether this cookie footprint needs a consent banner at all — likely not (strictly-necessary only), but that conclusion needs confirming against current ICO guidance, not just this scan.

**Sami's answer, on AQI/retention specifically:** AQI conversations are private; retain history only for user continuity and limited legitimate security/abuse-prevention/system-operation purposes — never sell or repurpose for unrelated ad targeting. Users get view/delete controls on AQI history, subject to necessary legal/security retention. Retention is category-specific — keep personal data only while an operational, contractual, legal, financial, safety or security reason actually exists. Account deletion does **not** automatically wipe community contributions — recipes/posts/discussions may be retained anonymised/de-identified where the community keeps benefiting, subject to removal rights. **His explicit instruction: Muzz maps the actual data flows, processors, storage and deletion behaviour first — before final Privacy Policy claims are written.** The cookie scan below is exactly that first step.

**Source:** A 9.1, A 9.2, A WEB-P1-008 · **Owner:** DPO / legal / engineering

The Privacy Policy lists data categories, processors and general rights, but not an operational purpose-by-purpose map.

**What's unblocked:** the cookie scan and data-flow mapping are pure dev work and can start today — that's the prerequisite Sami's asking for, not a separate blocker. **Still pending:** the policy calls that get layered on top of the map (exact retention periods per category, whether AI prompts train models, OpenAI processing terms) before the Privacy Policy text itself is finalised.

**Do — cookie scan can start now, independent of the blocker:**
- [ ] Run a production cookie and local-storage scan across: anonymous first visit, logged-in visit, payment handoff, embedded media, contact form, newsletter, social sharing, analytics, error monitoring, advertising tags.
- [ ] Update the policy from the actual inventory, not the intended architecture.

**Do — map each processing purpose to, once policy calls are made:**
- [ ] Purpose, data category, lawful basis, recipient, retention period, international transfer, user control, automated processing, deletion method.

**Gaps that need explicit coverage:**
- [ ] Public visibility of Social content
- [ ] Profiling and recommendations
- [ ] Reward-fraud decisions
- [ ] AI recipe prompts, and whether prompts or outputs feed model improvement
- [ ] AI support or moderation, and OpenAI processing terms
- [ ] Marketing and newsletter consent
- [ ] User-generated images
- [ ] Merchant and delivery-partner data sharing
- [ ] Support ticket retention (ties to WA-12)
- [ ] Exact retention categories

**Done when:** every processing purpose has a basis, retention and recipient, and the cookie policy matches a scanned inventory.

---

## Governance and content quality

### WA-49 · Create the Website Claims Register
✅ **READY — no blocker, just do it**
- [ ] **Not started**

**Source:** A P0.2, A WEB-P0-003 · **Owner:** CMO / content · **Enables:** WA-05

Every public quantitative claim needs a record before it can stay live. Building the register itself doesn't need Sami — populating it with final approved figures is what feeds WA-05.

**Fields:** Claim ID · Exact wording · Page and component · Claim category · Source system · Evidence document · Measurement date · Definition · Owner · Review date · Approval status

**Done when:** no public quantitative claim exists without a register entry.

---

### WA-50 · Create the Social Proof Register
✅ **READY — no blocker, just do it**
- [x] **Done.** Built `SOCIAL_PROOF_REGISTER.md` with all 8 real testimonials found this session (3 on `/delivery`, 3 on `/` homepage, 2 on `/for-restaurants` — the audit's own writeup only named the `/delivery` set). Each entry is flagged ⚠️ Partial, not ✅ Confirmed: the quotes and names are real (founder-confirmed), but identity proof, written consent, compensation disclosure and photo/name permission aren't on file for any of them yet. That's the open work — CMO/content owns collecting it, not a dev task. The on-page badges (WA-07) intentionally say "Customer review"/"Merchant review" rather than "Verified" until entries move to ✅ Confirmed.

**Fields:** proof of identity · order or merchant relationship · exact original statement · editing record · publication permission · image permission · date captured · review expiry · whether material benefit was provided

- [ ] Use verified-order labels where a review can be linked to an order ID.

**Done when:** every published testimonial maps to a register entry.

---

### WA-51 · Define the halal trust model
🟡 **FRAMEWORK BUILT (11 Aug 2026)** — public evidence UI still needs WA-55
- [x] **Done, as a governance document.** Built `HALAL_TRUST_MODEL.md` defining the 8 dimensions below and — more importantly — auditing what real evidence data already exists versus what's still just described. Found `public.merchants` + `public.merchant_documents` (`supabase/migrations/033_merchant_dashboard.sql`) already tracks real per-merchant evidence: halal certificate, food hygiene, business registration, public liability, each with a genuine `uploaded → under_review → approved/rejected` workflow, a named reviewer and a review date, already reviewed today in `admin/merchants/[id]/page.tsx`. This is real Evidence/Certification-dimension data, not proposed. **The gap:** it has no path to the public. The restaurants a customer actually orders from live on Hyperzod (a separate platform, WA-32's territory), which doesn't read from `merchant_documents` at all, and this codebase's own `/delivery` page shows a static hardcoded restaurant list, not live data — so there's currently no page anywhere that *could* show this evidence even if wired up. WA-04's "Halal-Focused"/"Halal Status Reviewed" badges are confirmed as the correct honest state given this: they claim exactly what's true (declaration + review at onboarding) and nothing more.
- [ ] **Not built:** the public evidence page itself (that's WA-55), and structured data for the Premises/Handling/Welfare dimensions, which don't have DB columns yet — not worth adding until there's a UI to show them.

**Source:** A 4.1, A WEB-P0-004 · **Owner:** Trust lead · **Enables:** WA-04

Across the site "halal" currently means eight different things: merchant declaration, product certification, scholar verification, recipe verification, platform values, ethical sourcing, cultural relevance and community trust. These are not interchangeable. The framework below is already fully specified — building it doesn't need Sami, only applying it to WA-04's badges does.

**Each status must answer one precise question:**

| Dimension | Question |
| --- | --- |
| Food status | Is the menu or product represented as halal? |
| Evidence | What documents or declarations were reviewed? |
| Certification | Was external certification provided, and what does it cover? |
| Premises | Is alcohol or non-halal product present? |
| Handling | Are separation and contamination controls documented? |
| Welfare | Is there evidence supporting animal-welfare claims? |
| Review | Who reviewed the information and when? |
| Conduct | Is the merchant operating responsibly on HalalMe? |

- [ ] Never use a broad badge to imply all eight dimensions are satisfied.

**Done when:** every public status maps to a defined evidence level.

---

### WA-52 · Establish live / beta / coming-soon product labels
🟡 **WORST INSTANCES FIXED (11 Aug 2026)** — pre-launch risk closed; full label system still open
- [x] **Fixed the actual live risk, not the full labelling system.** Checked what's really publicly reachable first: `/fresh`, `/travel`, `/marketplace` are all middleware-redirected to `/` (`middleware.ts:34-37`), and correctly absent from `sitemap.ts` and disallowed in `robots.ts` — so those pages themselves were never the exposure. The real exposure was 3 live, Google-indexed blog posts actively instructing readers to go use "HalalMe Travel," "HalalMe Fresh" and "HalalMe Marketplace" today, complete with invented specific features ("verified hotel and restaurant listings," "prayer time notifications and qibla direction features," "ethical sourcing standards") for products that don't exist yet — a reader clicking through would hit the middleware redirect. Removed all three promotional plugs from `src/data/blogPosts.ts`. Checked Footer, Header, About and Help for the same pattern — clean, nothing else referenced these three verticals as live.
- [ ] **Not done:** the full Live/Beta/Coming-soon/Concept/Deprecated labelling system across blog content, pillar pages and navigation — this fix closed the specific deceptive-claim instances found, not the general infrastructure this item describes.

**Source:** A 6.6 · **Owner:** Product + content

**Done when:** no unqualified present-tense claim exists for a non-live product *(true today — the found instances are gone)*, and a general labelling system exists for future product references *(not built)*.

---

### WA-53 · Introduce editorial governance for the blog
🟡 **RISKIEST INSTANCES FIXED (11 Aug 2026)** — full governance system still open
- [x] **Fixed the specific fabricated-authority problem, not the full governance system.** `src/data/blogPosts.ts` is documented in this repo's own `CLAUDE.md` as "static mock data for features not yet backed by DB" — meaning these bylines were never verified real people. Two of them used unverified formal credentials on health/nutrition content: "**Dr.** Sarah Ahmed" on an article making specific, uncited claims ("studies have shown," "research confirms... improved insulin sensitivity") and "**Prof.** Ibrahim Khan" on a food-history piece. Removed both honorifics rather than assume they're earned — the safe direction either way (costs nothing if they turn out to be real, avoids a genuine fake-credential problem if they're not, same risk logic used on WA-07's testimonial badges). Also softened "Coach Tariq Hussain — Sports Nutrition Specialist" (implies a nutrition credential) to "Tariq Hussain — Sports & Fitness Writer." Added a plain-language medical/dietary disclaimer to both health-content articles (Sarah Ahmed's halal-diet piece, Tariq Hussain's athlete-nutrition piece). Also fixed a blanket-verification claim found in the same file while in there: "every vendor... undergoes strict verification" → "merchants declare their halal status at onboarding, and we review the supporting evidence" — same WA-04 pattern, missed in the original sweep since it was in blog content, not page components.
- [ ] **Not done:** the full governance system — reviewer field, last-reviewed date, citations/evidence level, conflicts-of-interest disclosure, AI-assistance disclosure, per-article live/planned/conceptual service tags. `BlogPost`'s type only has `name`/`avatar`/`role`/`date` today; adding the rest is a real schema + admin-UI project, not a copy fix.

**Source:** A 4.4, A WEB-P2-002 · **Owner:** Brand + content

**Each article should display:**
- [ ] Author identity and biography
- [ ] Reviewer, where relevant
- [ ] Publication date and last reviewed date
- [ ] References and evidence level
- [x] Scope disclaimer — done for the two health/nutrition articles specifically; not yet a general per-article field
- [ ] Conflicts of interest
- [ ] Whether AI assisted drafting
- [ ] Whether the referenced HalalMe service is live, planned or conceptual

**Done when:** author, reviewer, citation and AI-assistance rules are operational *(structural system not built)* — but the specific fake-credential and blanket-claim instances found are gone *(done)*.

---

### WA-54 · Connect website statistics to live source systems
✅ **READY — no blocker, just do it**
- [ ] **Not started**

**Source:** A 4.2, A WEB-P2-003 · **Owner:** Data + engineering · **Depends on:** WA-05, WA-49

Static marketing figures should not survive long term. Each metric should come from a defined query. The query infrastructure can be built now; only the final published number waits on WA-05.

**Example specification:**
```
Active restaurants
  Definition:  Merchant approved + accepting orders in the previous 30 days
  Data source: Merchant database
  Refresh:     Daily
  Display:     Dynamic
  Owner:       Delivery Operations
```

- [ ] Remove any static marketing figure where no reliable live query exists.

**Done when:** website statistics originate from defined live queries.

---

### WA-55 · Launch the public trust panel
✅ **READY — no blocker, just do it**
- [ ] **Not started**

**Source:** A WEB-P2-004, A Stage 4 · **Owner:** Trust + product · **Depends on:** WA-51 (also ready)

**Do:**
- [ ] Publish a public evidence summary per merchant and per cause, with a review date and expandable detail.
- [ ] Add verified-order reviews and contributions.
- [ ] Implement explicit cross-pillar value ownership in the UI.
- [ ] Build a permanent legal, claim and content review cadence so this audit does not need repeating from scratch.

**Done when:** a customer can verify a trust claim themselves, without contacting support.

---

### WA-56 · Reduce JavaScript and CSS payload
✅ **READY — no blocker, just do it**
- [x] **Partially done — the clear, verifiable win is in; the rest needs a bigger session.** `@next/bundle-analyzer` isn't installed, and installing it + interpreting a real report + acting on it is more than today's remaining scope. What I could verify directly: `@react-spring/web` was a listed dependency with **zero imports anywhere in `src`** (confirmed via a full-repo grep before touching it) — pure dead weight, removed via `npm uninstall`. Checked the audit's "whole-icon-set imports" claim against the actual code: every `lucide-react` import already uses named imports (`import { X, Y } from "lucide-react"`), which is already tree-shakeable — that part of the finding didn't apply. `gsap` is used in 5 files for scroll-pin animations `framer-motion` doesn't handle the same way — legitimate, load-bearing usage, not something to strip without a real animation rewrite. **Still open:** installing `@next/bundle-analyzer` and doing the actual chunk-by-chunk analysis the audit describes, to find further real reductions beyond the one dead dependency.

**Source:** B HM-26 · **Owner:** Dev

1.37 MB of JavaScript across 17 chunks, largest 413 kB, plus a single 204 kB CSS file. That is high for Tailwind and suggests purge is not fully effective. The dependency list includes both `framer-motion` and `gsap`, plus `@react-spring/web`, which is three animation libraries.

**Do:**
- [ ] Run `@next/bundle-analyzer`. Look first at the animation libraries and any whole-icon-set imports from `lucide-react`.
- [ ] Consolidate onto fewer animation libraries where practical.
- [ ] Import icons individually. Dynamic-import below-the-fold interactive components.
- [ ] Check the Tailwind `content` globs cover only real source paths.

**Done when:** first-load JS is under 300 kB on the homepage and CSS is under 60 kB.

---

# Appendix A — Verified as already done, excluded

These appeared in the audits but are resolved in the current code on `dev`. Listed so nobody re-opens them.

| Audit item | Status | Evidence |
| --- | --- | --- |
| B HM-05 — install analytics | **Done** (events still open, see WA-29) | `@vercel/analytics` + `@vercel/speed-insights` mounted in `src/app/layout.tsx:94-95` |
| A P0.5 — contact form is a false-success form | **Done** (hardening still open, see WA-12) | `src/app/api/contact/route.ts` creates a real ticket, notifies the team, rate limited 5 per 10 min |
| B HM-08 — sitemap misses blog posts | **Mostly done** (static gaps only, see WA-17) | `src/app/sitemap.ts` pulls recipes, hub posts and blog posts live from Supabase |
| A section 7 — no error monitoring | **Done** | `@sentry/nextjs` configured, `withSentryConfig` in `next.config.ts` |
| B HM-14 — OG dimensions and Twitter card missing | **Done** (image asset still open, see WA-26) | `src/app/layout.tsx:55-64` sets width, height and `summary_large_image` |
| B HM-01 — `metadataBase` not set | **Done** (root canonical still open, see WA-13) | `src/app/layout.tsx:51` |
| Security headers baseline | **Done** (CSP still open, see WA-47) | `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` in `next.config.ts` |
| A section 7 — rate limiting | **Done** | `@upstash/ratelimit` via `src/lib/rateLimit.ts` |
| Phase 2 verticals exposed | **Done** | `/fresh`, `/travel`, `/marketplace` blocked at middleware and disallowed in `src/app/robots.ts` |

---

# Appendix B — Governance context

Implementation must stay consistent with the existing internal architecture.

| Reference | Principle |
| --- | --- |
| HME-BRAND-001 | Master brand and pillar identity. One identity, one trusted relationship, one account, one connected ecosystem. |
| HME-DEL-BRAND-001 | Delivery is a complete halal food-commerce world, not a generic courier interface. |
| HME-DEL-AVDS-001 | Brand expression rises during inspiration and campaigning, recedes during search, payment and operations. |
| HME-DEL-CONTENT-001 | Messaging is clear, warm, confident, commercially literate and respectful. |
| HME-DEL-MEOS-001 | The merchant owns the food and merchant identity. HalalMe owns the exclusive opportunity. |
| Trust and evidence | Halal status, certification, premises context, sourcing, animal welfare, conduct and impact claims must be distinguished and evidenced. |
| Value ownership | Food Points, Food Wallet, HalalMe+ and Bronze/Silver/Gold/Platinum belong to Delivery. Cross-pillar visibility does not transfer ledger ownership. |
| Experience | Impressive on entry, effortless to navigate, compelling to explore. Depth without density. |

**Governing priority order:** corporate continuity → claims correction → trust architecture → product-state honesty → conversion → SEO and growth.

Until the first four are stable, more traffic amplifies exposure faster than it builds brand equity.

---

# Sign-off

## Needs Sami (🔴 serious blockers)

| Decision area | Owner | Status | Date |
| --- | --- | --- | --- |
| Corporate and legal (WA-01, WA-02) | Sami | Open | |
| Claims and trust (WA-04, WA-05, WA-09) | Sami | Open | |
| Compliance (WA-10, WA-48) | Sami | Open | |

## Decided by me (🟡 your call — log the decision here once made)

| Decision area | Decided | Date |
| --- | --- | --- |
| Testimonials (WA-07) | Keep the real testimonials (verbatim quotes and dates, not touched). Badges read "Customer review" / "Merchant review" rather than "Verified" until identity/consent are on file — see `SOCIAL_PROOF_REGISTER.md` | 2026-08-08 |
| Hub vs Social (WA-30) | Social. Route renamed `/hub` → `/social`, permanent redirects live | 2026-08-08 |
| Brand spelling (WA-33) | HalalMe (one word). Site copy swept — entity-name half still waits on WA-02 | 2026-08-08 |
| Service taxonomy (WA-35) | Five services: Delivery, Kitchen, Social, Charity, Rewards. Applied to nav/footer/About/meta | 2026-08-08 |
| Positioning line (WA-36) | "Built around halal values. Open to everyone." | 2026-08-08 |
