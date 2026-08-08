# HalalMe Website Audit — Consolidated Action List

Single source of truth for the outstanding work from the August 2026 website audits.

**Merged from:**

| Source | Document | Original IDs |
| --- | --- | --- |
| Audit A | HME-WEB-AUDIT-001 (GPT, 6 Aug 2026) | P0.1–P0.8, sections 3–9, WEB-P0/P1/P2-xxx |
| Audit B | HalalMe Website Fix Plan (Viktor, 6 Aug 2026) | HM-01 to HM-27 |
| Audit C | HalalMe-Website-Fix-Plan.md | Same content as Audit B, no unique items |

Audit C is a markdown copy of Audit B, so it contributed nothing new.

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
| P0 — this week | 12 (WA-01 to WA-12) | 6 | 0 | 0 | 6 | 0 | 5 / 12 |
| P1 — next two weeks | 19 (WA-13 to WA-31) | 0 | 0 | 0 | 18 | 1 | 18 / 19 |
| P2 — this quarter | 25 (WA-32 to WA-56) | 1 | 2 | 2 | 19 | 1 | 7 / 25 |
| **Total** | **56** | **7** | **2** | **2** | **43** | **2** | **30 / 56** |

*Recount note (8 Aug 2026, later session): the previous table undercounted P0 by one (WA-03/06/08/12 were all already checked off, four items not three) — corrected here rather than carried forward. WA-07, WA-30 and WA-35's decisions are now made (see [Sign-off](#sign-off)), so they've moved out of the 🟡 column; WA-33's brand-spelling half is decided too, its entity-name half stays 🟡 pending WA-02.*

**⏭️ Skipped (2), confirmed 8 Aug 2026:** WA-27 and WA-32 both live on `delivery.halalme.co.uk`, the separate Hyperzod white-label platform — not this codebase. Left as-is on purpose, not an oversight. Not counted toward "done," not sitting in the ready queue either.

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

**⏭️ WA-27 and WA-32 removed from this list** — both live on the separate Hyperzod platform, confirmed intentionally skipped, see the note above the progress table.

---

# P0 — Immediate risk control

Legal exposure, misleading claims, or costing money right now.

## Legal and corporate

### WA-01 · Resolve the Companies House position
🔴 **SERIOUS BLOCKER — needs Sami / accountant / solicitor**
- [ ] **Not started**

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
🔴 **SERIOUS BLOCKER — needs Sami's exact wording** (and WA-01 resolved)
- [ ] **Not started**

**Source:** A P0.1, A WEB-P0-002, B HM-03 · **Owner:** Legal + dev · **Blocked on:** WA-01 and Sami's wording

**Current state in code:**
- `src/app/privacy/page.tsx:77,84` and `src/app/terms/page.tsx:87,188,197` say "HalalMe Delivery LTD".
- `src/app/privacy/page.tsx:86,214` and `src/app/terms/page.tsx:89,226` give 71-75 Shelton Street, London, WC2H 9JQ. Companies House shows PO Box 4385, Cardiff CF14 8LH.
- `src/components/layout/Footer.tsx:275` says "Halal Delivery LTD"; `Footer.tsx:282` says "© HalalMe Delivery LTD". Two names in one footer.
- `src/app/contact/page.tsx:382` says "HalalMe Delivery Ltd", and "Find Us" gives only "United Kingdom".

**Do:**
- [ ] Wait for corrected wording from Sami. Do not invent an address.
- [ ] Pattern to use: *"HalalMe is a trading name of Halal Delivery Ltd, a company registered in England and Wales (No. 13450710). Registered office: `<address>`."*
- [ ] Put the entity string in **one exported constant** and import it into Terms, Privacy, Cookies, Contact and the footer. Not five copies.
- [ ] Add registered name, company number, registered address and a contact email to the footer. UK e-commerce regulations expect these to be readily accessible.
- [ ] Add a real geographic address to `/contact`.

**Done when:** one constant holds the entity string, every page imports it, and the name and registered office match Companies House exactly.

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
🔴 **SERIOUS BLOCKER — needs a real scholar/certifying body named, and the charities named**
- [ ] **Not started**

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

**What's blocking it:** the badge language can't just be softened generically — it needs either a real named scholar/certifying body, or Sami's sign-off that none exists and the "no authority" rewrite (below) is correct instead.

**Do — once Sami answers:**
- [ ] Name the scholar or certifying body, or rewrite to describe the actual process. Example: "We verify halal certification at merchant onboarding."
- [ ] Name the charities and link their Charity Commission entries.
- [ ] Replace universal badges with evidence-specific statuses: *Merchant-declared halal · Supplier evidence reviewed · Certification supplied · Operational information reviewed · Site review completed · Last reviewed: [date]*.
- [ ] Public wording must not imply that HalalMe is a religious certifying authority, that every merchant passed the same threshold, that every product stays continuously verified, or that AI recipes were independently checked.

**Done when:** every trust claim on the site traces to a named, checkable source.

---

### WA-05 · Reconcile the numbers used across the site
🔴 **SERIOUS BLOCKER — needs Sami's sign-off on every headline figure**
- [ ] **Not started**

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

**Do — once Sami answers:**
- [ ] Sami fixes one agreed figure per metric with a precise definition. Example: "signed" versus "live today".
- [ ] Devs apply the agreed values from a **single constants module**. No literal numbers in page copy.
- [ ] Where no reliable figure exists, replace with accurate qualitative language. Example: "Discover participating halal restaurants through HalalMe Delivery."
- [ ] Change "favorite" to "favourite" and sweep for other US spellings. *(This part doesn't need Sami — can do today.)*
- [ ] Name the five cities.

**Done when:** one constants module holds every headline figure, and meta descriptions and on-page copy agree on the service count and list all five.

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
🔴 **SERIOUS BLOCKER — needs legal/finance decisions on the fund flow**
- [ ] **Not started**

**Source:** A P0.6, A WEB-P0-007, A 5.5 · **Owner:** Legal / finance / Community

The Charity page claims direct giving, a 95/5 split, donor and fundraising totals, verified causes and international participation, and closes with emotional pressure. `/charity/causes` returned only a loading state to the crawler, so none of it is publicly verifiable.

**What's blocking it:** none of this is a copy tweak — it requires actual decisions about money handling that only Sami/finance can make.

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
🔴 **SERIOUS BLOCKER — needs approval to commission a legal/OSA assessment**
- [ ] **Not started**

**Source:** A P0.7, A WEB-P0-008 · **Owner:** Legal / Social / moderation

Hub is a user-to-user service with profiles, posts, comments and community activity. In-scope services may be required to hold a children's access assessment and illegal-content risk assessment, and to provide effective reporting and complaints routes. A user-facing report function was previously deferred in the admin plan.

**What's blocking it:** this needs a legal scoping engagement commissioned before dev can build the right thing — building a reporting UI without the assessment risks building the wrong one.

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
✅ **READY — no blocker, just do it**
- [ ] **Not started**

**Source:** B HM-04 · **Owner:** Ops · **Where:** Cloudflare DNS

`_dmarc.halalme.co.uk` returns NXDOMAIN. SPF exists (`v=spf1 include:_spf-eu.ionos.com ~all`). Without DMARC anyone can spoof `@halalme.co.uk`, and transactional mail is more likely to be filtered.

**Not a code task — handed off 8 Aug 2026.** No DNS access from this session. Exact record to paste into Cloudflare (DNS → Add record): `TXT` at name `_dmarc`, value `v=DMARC1; p=none; rua=mailto:dmarc@halalme.co.uk; fo=1`. Still needs doing.

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

**Source:** A 3.4, A WEB-P1-002 · **Owner:** Product + dev

The public page is branded "HalalMe Social" but the route, legal content and internal references all use Hub. `src/components/layout/Footer.tsx:11` maps `{ label: "Social", href: "/hub" }`, which is the mismatch in one line. Audit A recommends HalalMe Social as the stronger public name — this is a naming call you're already trusted to make.

**Do:**
- [ ] Pick "Social" (recommended) and align: navigation, page title, H1, canonical URL, permanent redirect from the old route, Terms and Privacy references, analytics event names, support taxonomy.

**Done when:** one name, one URL strategy, one analytics taxonomy.

---

### WA-31 · Resolve Rewards ownership and tier names
✅ **READY — no blocker, just do it**
- [x] **Done — tier naming half, now actually complete.** Renamed Diamond → Platinum in the 3 code locations found in the earlier session: `RewardsTab.tsx`'s `TIER_LABEL` map, `rewards/page.tsx`'s tier table and hero text, and `HorizontalServices.tsx`'s Rewards preview card. **Found a 4th location this session, in the database, not the code:** the `badges` catalog's `tier-diamond` row still had `name = "Diamond"`, `description = "Reached Platinum tier"` — the earlier fix only touched the reward_tiers display map, not the separate badges table shown on the dashboard's "Your Badges" section. Caught this from a screenshot the founder sent showing the badge still reading "Diamond" live. Fixed via migration `070_hub_to_social_rename.sql`, applied directly to the remote DB and verified. **Still not done:** the ownership-split half (Delivery-owned vs Rewards-owned language in the copy) — same work as WA-43, left for that pass.

**Source:** A 3.5, A WEB-P1-003 · **Owner:** Delivery + Rewards

The live Rewards page presents points, daily login rewards and tiers as an ecosystem-wide gamification layer. The approved architecture already puts Food Points, Food Wallet and membership inside **Delivery**, and already defines tiers as Bronze / Silver / Gold / **Platinum** — this is applying an existing decision, not making a new one.

**Confirmed conflicts in code:**
- `src/app/rewards/page.tsx:32,315` uses "Diamond".
- `src/app/(protected)/dashboard/RewardsTab.tsx:18` maps `platinum` → label `"Diamond"`, so the database and the UI already disagree.
- `src/components/navigation/HorizontalServices.tsx:686` says "Bronze to Diamond tiers".

**Do:**
- [ ] Rename Diamond to Platinum everywhere, including the `TIER_LABEL` map.
- [ ] Split ownership in the copy. **Delivery-owned:** Food Points, Food Wallet, HalalMe+, Bronze/Silver/Gold/Platinum, delivery discounts and redemptions. **Rewards-owned:** ecosystem access, recognition, cross-pillar opportunities, non-Delivery unlocks.
- [ ] Rewards may surface an event that originated in Delivery, but must not imply it owns the Delivery ledger.

**Done when:** Food Points and membership are presented as Delivery-owned, and one tier vocabulary is used site-wide.

---

# P2 — This quarter

## Brand and ecosystem

### WA-32 · Bring delivery.halalme.co.uk into the HalalMe brand
⏭️ **SKIPPED — intentional, not a gap.** Same reason as WA-27: lives on the separate Hyperzod platform. Confirmed 8 Aug 2026 this is deliberately left as-is.
- [ ] Not started (won't-fix by decision)

**Source:** B HM-20 · **Owner:** Ops + brand · **Highest branding impact**

The marketing site is cream on deep green. The Hyperzod white-label ordering platform is purple, with different logo treatment, different typography, and a footer reading "© Copyright 2021 – 2026 Halal Delivery LTD". CTAs open it in a new tab. This is the first thing a paying customer sees after clicking the main CTA. HalalMe's colours and logo are already defined — this is applying them, not deciding them.

**Do:**
- [ ] Apply HalalMe colours, logo and typography in the Hyperzod theme settings. Most white-labels expose primary colour, logo, favicon and custom CSS.
- [ ] Match the footer entity string to WA-02 once that's resolved (use a placeholder for now if needed, don't block this whole item on it).
- [ ] Set the platform favicon and page titles to HalalMe.
- [ ] Where the theme cannot be changed, list the specific limits so a longer-term decision can be made.

**Done when:** side-by-side screenshots of both domains read as one product, with no purple default theme, no Hyperzod branding and no stale copyright line.

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
✅ **READY — no blocker, just do it**
- [x] **Done — short-term fix.** Dropped `target="_blank" rel="noopener noreferrer"` from all 6 "Order Now"-style CTAs on `/delivery` that link to `delivery.halalme.co.uk` (now navigates same-tab, so back-navigation and funnel tracking actually work). Left the individual restaurant deep-links (browsing/comparing multiple merchants) as `target="_blank"` — different use case, not the CTA the audit was pointing at. Softened the literal false claim: homepage hero said "Live daily life the halal way, without switching apps" directly under the H1 — highest-visibility spot on the site — replaced with "Food, recipes, community and giving — all under one HalalMe account," which doesn't promise something Delivery ordering doesn't currently do. **Not done:** the medium-term fix (actual SSO between the two domains) — that's a real cross-platform auth project, correctly scoped as its own thing, not part of this quarter's item.

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
✅ **READY — no blocker, just do it**
- [ ] **Not started**

**Source:** A 5.2 · **Owner:** Product marketing

The Delivery page is visually the strongest area but far too long on mobile, and it restates the same value propositions repeatedly.

**Do:**
- [ ] Split into a short, order-led, location-led **customer conversion page**, and a longer **Delivery brand page** covering mission, merchant value and ecosystem connection.
- [ ] First mobile viewport should show: location entry, available merchant count for that location, actual current fulfilment methods, one verifiable offer, direct marketplace CTA.

**Done when:** the conversion page fits a short mobile journey and the brand story lives separately.

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
✅ **UNBLOCKED (8 Aug 2026) — WA-30 decided Social — but not yet built**
- [ ] **Not started.** WA-30's decision and route rename are done, so nothing is stopping this anymore — but the rename itself was routing/naming only. The actual reframe below (lead value prop, distinguish content types, surface moderation/reporting) is separate content + UX work that hasn't happened yet.

**Source:** A 5.4 · **Owner:** Product marketing · **Depends on:** ~~WA-30~~ *(resolved 8 Aug 2026)*

Reporting and moderation pathways are not prominent, and the visitor cannot tell what content is public, private or account-only.

**Do — once you've picked the name in WA-30:**
- [ ] Lead with the unique value: *"Discover halal places and experiences through people who have actually been there."*
- [ ] Then distinguish: community recommendations, verified-order contributions, recipes, general posts, merchant content, moderation and reporting, and public versus account-only visibility.

**Done when:** the page explains what Social is for and how content is governed.

---

### WA-42 · Rebuild Charity around evidence and financial clarity
⛔ **WAITING on WA-09** (not a separate ask — see the serious-blockers list)
- [ ] **Not started**

**Source:** A 5.5 · **Owner:** Community + product · **Depends on:** WA-09

**What's blocking it:** can't publish a donation journey before the fund flow, fees and legal role are documented in WA-09.

**Target flow, once WA-09 is resolved:** choose an approved cause → understand who operates it → see what evidence HalalMe reviewed → understand fees before payment → donate through the identified payment flow → receive confirmation → see transfer and impact status later.

**Done when:** impact language moves from emotional pressure to informed agency, and fees are visible before payment.

---

### WA-43 · Reframe Rewards around provenance and usefulness
✅ **READY — no blocker, just do it**
- [ ] **Not started**

**Source:** A 5.6 · **Owner:** Rewards product · **Depends on:** WA-31 (also ready)

A visitor cannot tell what points exist, where they are earned, which are spendable, which are status-only, what transfers, what expires, what belongs to Delivery, and what Rewards itself owns. Daily login rewards also conflict with the principle of rewarding useful activity rather than manufacturing engagement.

**Do:**
- [ ] Organise the page around four questions: *What became available? Why did I receive it? Where can I use it? What happens next?*
- [ ] Stop leading with abstract points accumulation.

**Done when:** each reward on the page states its origin, its use and its expiry.

---

### WA-44 · Fix the select-role page
✅ **READY — no blocker, just do it**
- [ ] **Not started**

**Source:** A 5.8 · **Owner:** Product

The page mixes product navigation with operational roles. It carries an "Operational" label on the customer-facing exploration option, omits Charity from some service lists, uses four-services language, and leaves the relationship between personal, merchant and driver accounts unresolved.

**Do:**
- [ ] Use intention-based role language:
  - **Explore HalalMe** — for customers, cooks and community members
  - **Manage a restaurant** — for merchant owners and authorised staff
  - **Deliver with HalalMe** — for approved delivery partners
- [ ] Connect this later to one account with multiple authorised workspaces.

**Done when:** role labels describe user intention. *(Note: making the service list match WA-35 exactly waits on that taxonomy being locked — do the role-label fix now regardless.)*

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
✅ **READY — no blocker, just do it**
- [ ] **Not started**

**Source:** B HM-25 · **Owner:** Growth + dev

The consumer and merchant apps are live on Google Play and linked from nowhere on the site. `src/app/robots.ts` discloses three unreleased verticals (`/fresh`, `/travel`, `/marketplace`) with no way to register interest. No `not-found.tsx` exists anywhere in `src`, so 404s fall back to the Next.js default.

**Do:**
- [ ] Add Play Store badges to the footer and homepage, and App Store badges when available.
- [ ] Add email waitlist capture for Fresh, Travel and Marketplace.
- [ ] Build a `not-found.tsx` with search, popular links and brand voice.
- [ ] Reconsider advertising unreleased verticals in `robots.ts`. A `noindex` on those routes leaks less than a `Disallow` line naming them.

**Done when:** app links work, the waitlist stores submissions, and the 404 offers a route back.

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
🔴 **SERIOUS BLOCKER — needs legal/DPO policy calls**
- [ ] **Not started**

**Source:** A 9.1, A 9.2, A WEB-P1-008 · **Owner:** DPO / legal / engineering

The Privacy Policy lists data categories, processors and general rights, but not an operational purpose-by-purpose map.

**What's blocking it:** the cookie scan itself is pure dev work and can start today, but the data map requires policy decisions (retention periods, whether AI prompts feed model improvement, OpenAI processing terms) that need legal/Sami sign-off before publishing.

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
✅ **READY — no blocker, just do it**
- [ ] **Not started**

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
✅ **READY — no blocker, just do it**
- [ ] **Not started**

**Source:** A 6.6 · **Owner:** Product + content

Blog posts and pillar copy refer to planned or uncertain products in the present tense, including Fresh and Marketplace, which are not publicly operational. That creates mismatched search intent and visitors landing on unavailable products.

**Do:**
- [ ] Classify every product reference as **Live · Beta · Coming soon · Concept · Deprecated**.
- [ ] Only live products may be described without qualification.
- [ ] Apply the labels in blog content, pillar pages and navigation.

**Done when:** no unqualified present-tense claim exists for a non-live product.

---

### WA-53 · Introduce editorial governance for the blog
✅ **READY — no blocker, just do it**
- [ ] **Not started**

**Source:** A 4.4, A WEB-P2-002 · **Owner:** Brand + content

The blog carries health, nutrition, ethical sourcing and travel content, some of it under named professional personas with credentials. Those identities and credentials need verifying before the content is treated as expert guidance.

**Each article should display:**
- [ ] Author identity and biography
- [ ] Reviewer, where relevant
- [ ] Publication date and last reviewed date
- [ ] References and evidence level
- [ ] Scope disclaimer
- [ ] Conflicts of interest
- [ ] Whether AI assisted drafting
- [ ] Whether the referenced HalalMe service is live, planned or conceptual

Health and nutrition content must not be framed as authoritative simply because it appears on HalalMe.

**Done when:** author, reviewer, citation and AI-assistance rules are operational.

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
