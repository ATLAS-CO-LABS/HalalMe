# Social Proof Register

Tracks every testimonial/review published on the public site. Per [WA-50](WEBSITE_AUDIT_ACTIONS.md#wa-50--create-the-social-proof-register), no testimonial should be published without an entry here — this register is what the "Customer review" / "Merchant review" badges on the site are supposed to point back to.

**Owner:** CMO / content. **Status field meaning:**
- ✅ Confirmed — identity, consent and statement all verified
- ⚠️ Partial — quote and identity are real, but consent/compensation disclosure not yet on file
- ❌ Unconfirmed — not yet checked, do not publish until resolved

---

## Entries

| ID | Location | Name | Quote (start) | Date shown | Identity proof | Consent on file | Compensation disclosed | Photo/name permission | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SP-01 | `/delivery` testimonials | Zainab Javied | "Halal Me Delivery is a game-changer..." | 11 Oct 2023 | Not on file | Not on file | Not on file | Not on file | ⚠️ Partial |
| SP-02 | `/delivery` testimonials | Adyaan | "Ordered it yesterday extremely fast..." | 23 Apr 2024 | Not on file | Not on file | Not on file | Not on file | ⚠️ Partial |
| SP-03 | `/delivery` testimonials | Ibrahim Khawaja | "Ordered food last week it was very fast..." | 5 Apr 2024 | Not on file | Not on file | Not on file | Not on file | ⚠️ Partial |
| SP-04 | `/` homepage testimonials | Jani Fernandez | "The AI recipe feature is honestly incredible..." | Not shown — no date on file | Not on file | Not on file | Not on file | Not on file | ⚠️ Partial |
| SP-05 | `/` homepage testimonials | Maryam | "The community on here is unlike anything else..." | Not shown — no date on file | Not on file | Not on file | Not on file | Not on file | ⚠️ Partial |
| SP-06 | `/` homepage testimonials | Arbab | "The rewards are really good..." | Not shown — no date on file | Not on file | Not on file | Not on file | Not on file | ⚠️ Partial |
| SP-07 | `/for-restaurants` merchant quotes | Ahmed K. — Amigos, Leicester | "I was sceptical at first..." | Not shown — no date on file | Not on file | Not on file | Not on file | Not on file | ⚠️ Partial |
| SP-08 | `/for-restaurants` merchant quotes | Yusuf M. — Pizza Plaza, Burton | "We were paying 30% on Uber Eats..." | Not shown — no date on file | Not on file | Not on file | Not on file | Not on file | ⚠️ Partial |

---

## What's confirmed vs. what's still open

**Confirmed (2026-08-08):** all 8 quotes are real — not illustrative/placeholder copy, per founder confirmation during this session's WA-07 review. SP-01–SP-03 carry real, verbatim collection dates and are left untouched (editing a real customer's exact wording or date would misrepresent what they said/when — see the note on SP-01 below).

**Still open, before these can move to ✅ Confirmed:**
- [ ] Identity confirmation for each reviewer (order ID, booking reference, or equivalent link to a real transaction)
- [ ] Written consent to publish, for each reviewer
- [ ] Disclosure of whether any material benefit (discount, free item, payment) was given in exchange for the review
- [ ] Explicit permission for name/photo use (none currently carry a photo)
- [ ] SP-04–SP-08: original collection dates — currently unknown, so the site shows no date for these six rather than guessing one
- [ ] Review expiry date for each entry (recommend 24 months from collection date, then re-confirm or retire)

**SP-01 note:** the quote reads "Halal Me Delivery" (two words), which is the pre-WA-33 brand spelling. Left verbatim — it's the reviewer's own words, not site copy, so it isn't part of the WA-33 spelling sweep.

**Until the open items above are resolved:** the on-page badges read "Customer review" / "Merchant review" rather than "Verified customer" — the word "verified" is reserved for entries that reach ✅ Confirmed status with identity proof on file, consistent with [WA-51](WEBSITE_AUDIT_ACTIONS.md#wa-51--define-the-halal-trust-model)'s rule against broad claims implying a review process that hasn't actually happened.
