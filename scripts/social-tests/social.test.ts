/**
 * Offline unit tests for the Social pure libraries.
 *
 *   npm run test:social
 *
 * Covers link detection and URL safety (the "recipe link isn't clickable" bug),
 * keyset cursor helpers, composer validation and media rules. The database half
 * (validation trigger, recipe share points, RLS, feed paging) lives in
 * supabase/tests/075_social_posts_v2.test.sql and runs in a rolled-back
 * transaction.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  tokenizeText, extractRecipeIds, parseSafeUrl, internalPathFor, recipeIdFromPath,
  type TextSegment,
} from "../../src/lib/socialLinks";
import {
  cursorFromLastRow, cursorToRpcArgs, mergeUniqueById, prependUniqueById, newAsOf, sanitizeSearchTerm,
} from "../../src/lib/socialFeed";
import {
  validateDraft, mediaFileError, canAddMedia, fitWithin, sharePointsHint, inferMimeType, type ComposerDraft,
} from "../../src/lib/socialComposer";

const RID = "3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b";

const links = (segs: TextSegment[]) => segs.filter((s) => s.type === "link") as Extract<TextSegment, { type: "link" }>[];
const joined = (segs: TextSegment[]) => segs.map((s) => s.value).join("");

// ---------------------------------------------------------------------------
// Links
// ---------------------------------------------------------------------------

test("a pasted recipe link becomes an internal link to the recipe route", () => {
  const segs = tokenizeText(`Made this last night https://halalme.co.uk/kitchen/recipes/${RID} so good`);
  const [l] = links(segs);
  assert.ok(l, "link detected");
  assert.equal(l.internal, true);
  assert.equal(l.href, `/kitchen/recipes/${RID}`);
  assert.equal(joined(segs), `Made this last night https://halalme.co.uk/kitchen/recipes/${RID} so good`, "no text lost");
});

test("kitchen subdomain links resolve to the same in-app route", () => {
  const [l] = links(tokenizeText(`https://kitchen.halalme.co.uk/recipes/${RID}`));
  assert.equal(l.href, `/kitchen/recipes/${RID}`);
  const [l2] = links(tokenizeText(`https://kitchen.halalme.co.uk/kitchen/recipes/${RID}`));
  assert.equal(l2.href, `/kitchen/recipes/${RID}`, "already-prefixed path is not doubled");
});

test("www and bare-domain links are recognised", () => {
  assert.equal(links(tokenizeText(`www.halalme.co.uk/kitchen/recipes/${RID}`))[0].href, `/kitchen/recipes/${RID}`);
  assert.equal(links(tokenizeText(`see halalme.co.uk/kitchen/recipes/${RID}.`))[0].href, `/kitchen/recipes/${RID}`);
});

test("trailing punctuation stays text, balanced brackets stay in the URL", () => {
  const segs = tokenizeText("Read https://example.com/page.");
  assert.equal(links(segs)[0].href, "https://example.com/page");
  assert.equal(segs[segs.length - 1].value, ".");
  assert.equal(links(tokenizeText("(see https://example.com/a)"))[0].href, "https://example.com/a");
  assert.equal(links(tokenizeText("https://en.wikipedia.org/wiki/Biryani_(dish)"))[0].href, "https://en.wikipedia.org/wiki/Biryani_(dish)");
});

test("external links are external and keep their query string", () => {
  const [l] = links(tokenizeText("https://example.com/x?y=1#z"));
  assert.equal(l.internal, false);
  assert.equal(l.href, "https://example.com/x?y=1#z");
});

test("unsafe URLs are never linked", () => {
  for (const bad of [
    "javascript:alert(1)",
    "https://halalme.co.uk@evil.example/login",
    "https://user:pass@example.com/",
    "data:text/html;base64,PHNjcmlwdD4=",
    "https://" + "a".repeat(2100) + ".com",
  ]) {
    assert.equal(links(tokenizeText(`click ${bad} now`)).length, 0, `not linked: ${bad.slice(0, 40)}`);
  }
  assert.equal(parseSafeUrl("ftp://example.com"), null);
  assert.equal(parseSafeUrl("https://nodot"), null);
});

test("a lookalike domain is external, not internal", () => {
  const [l] = links(tokenizeText("https://halalme.co.uk.evil.example/kitchen/recipes/" + RID));
  assert.equal(l.internal, false);
  assert.deepEqual(extractRecipeIds("https://halalme.co.uk.evil.example/kitchen/recipes/" + RID), []);
});

test("emails are not links and not mentions", () => {
  const segs = tokenizeText("mail team@halalme.co.uk please");
  assert.equal(links(segs).length, 0);
  assert.equal(segs.filter((s) => s.type === "mention").length, 0);
});

test("mentions are detected with username rules", () => {
  const segs = tokenizeText("thanks @aisha_cooks and @Bad and @ab!");
  const mentions = segs.filter((s) => s.type === "mention");
  assert.deepEqual(mentions.map((m) => m.value), ["@aisha_cooks"]);
  assert.equal(joined(segs), "thanks @aisha_cooks and @Bad and @ab!");
});

test("localhost / preview links count as internal on that host", () => {
  const url = parseSafeUrl(`http://localhost:3000/kitchen/recipes/${RID}`)!;
  assert.equal(internalPathFor(url), null, "not internal without the current host");
  assert.equal(internalPathFor(url, "localhost:3000"), `/kitchen/recipes/${RID}`);
});

test("recipe ids are extracted once, in order, lowercased", () => {
  const upper = RID.toUpperCase();
  const text = `a https://halalme.co.uk/kitchen/recipes/${upper} b https://kitchen.halalme.co.uk/recipes/${RID} c https://halalme.co.uk/kitchen/recipes/not-a-uuid`;
  assert.deepEqual(extractRecipeIds(text), [RID]);
  assert.equal(recipeIdFromPath(`/kitchen/recipes/${RID}?ref=social`), RID);
  assert.equal(recipeIdFromPath(`/kitchen/recipes/${RID}/edit`), null);
});

test("plain text and empty input", () => {
  assert.deepEqual(tokenizeText(""), []);
  assert.deepEqual(tokenizeText("just words"), [{ type: "text", value: "just words" }]);
});

// ---------------------------------------------------------------------------
// Feed
// ---------------------------------------------------------------------------

test("cursor carries the right sort key per mode", () => {
  const row = { id: "p1", sort_ts: "2026-10-01T00:00:00Z", sort_score: 1.25 };
  assert.deepEqual(cursorFromLastRow("latest", row, null), { mode: "latest", id: "p1", ts: row.sort_ts, score: null, asOf: null });
  const fy = cursorFromLastRow("for_you", row, "2026-10-02T00:00:00Z");
  assert.equal(fy.score, 1.25);
  assert.equal(fy.ts, null);
  assert.equal(fy.asOf, "2026-10-02T00:00:00Z");
  assert.deepEqual(cursorToRpcArgs(null), { p_cursor_ts: null, p_cursor_score: null, p_cursor_id: null });
});

test("for_you as-of is pinned slightly ahead, other modes have none", () => {
  const now = Date.parse("2026-10-18T12:00:00Z");
  assert.equal(newAsOf("latest", now), null);
  assert.equal(newAsOf("for_you", now), "2026-10-18T12:02:00.000Z");
});

test("merge and prepend never duplicate", () => {
  const a = [{ id: "1" }, { id: "2" }];
  assert.deepEqual(mergeUniqueById(a, [{ id: "2" }, { id: "3" }, { id: "3" }]).map((p) => p.id), ["1", "2", "3"]);
  assert.equal(mergeUniqueById(a, [{ id: "1" }]), a, "unchanged list keeps identity");
  assert.deepEqual(prependUniqueById(a, [{ id: "0" }, { id: "1" }]).map((p) => p.id), ["0", "1", "2"]);
});

test("search terms cannot inject PostgREST filter syntax", () => {
  assert.equal(sanitizeSearchTerm("biryani,content.eq.x)"), "biryani content.eq.x");
  assert.equal(sanitizeSearchTerm("100% _halal_ \\ \"quoted\""), "100 halal quoted");
  assert.equal(sanitizeSearchTerm("a".repeat(200)).length, 80);
});

// ---------------------------------------------------------------------------
// Composer
// ---------------------------------------------------------------------------

const draft = (over: Partial<ComposerDraft>): ComposerDraft => ({
  type: "general", content: "", title: "", reviewSubject: "", rating: 0, recipeId: null, mediaCount: 0, ...over,
});

test("each post type has its own requirements", () => {
  assert.ok(validateDraft(draft({})).content, "empty post refused");
  assert.deepEqual(validateDraft(draft({ mediaCount: 1 })), {}, "photo-only post allowed");
  assert.ok(validateDraft(draft({ type: "recipe" })).recipe, "recipe needs a recipe");
  assert.deepEqual(validateDraft(draft({ type: "recipe", recipeId: RID })), {}, "caption optional");
  assert.ok(validateDraft(draft({ type: "question", title: "Short?" })).title);
  assert.deepEqual(validateDraft(draft({ type: "question", title: "Where can I find halal gelatine?" })), {});
  const review = validateDraft(draft({ type: "review", content: "ok" }));
  assert.ok(review.reviewSubject && review.rating && review.content);
  assert.deepEqual(validateDraft(draft({ type: "review", reviewSubject: "Grill House", rating: 5, content: "Brilliant mixed grill." })), {});
  assert.ok(validateDraft(draft({ content: "x".repeat(5001) })).content);
});

test("media file rules", () => {
  assert.equal(mediaFileError({ type: "image/jpeg", size: 2_000_000 }), null);
  assert.ok(mediaFileError({ type: "application/pdf", size: 10 }));
  assert.ok(mediaFileError({ type: "image/png", size: 0 }));
  assert.ok(mediaFileError({ type: "image/png", size: 26 * 1024 * 1024 }));
  assert.ok(mediaFileError({ type: "video/mp4", size: 51 * 1024 * 1024 }));
  assert.equal(canAddMedia([], "video"), null);
  assert.ok(canAddMedia(["image"], "video"));
  assert.ok(canAddMedia(["video"], "image"));
  assert.ok(canAddMedia(["image", "image", "image", "image"], "image"));
  assert.equal(canAddMedia(["image", "image", "image"], "image"), null);
});

test("blank MIME types fall back to the file extension", () => {
  assert.equal(inferMimeType("IMG_0042.HEIC", ""), "image/heic");
  assert.equal(inferMimeType("clip.mov", ""), "video/quicktime");
  assert.equal(inferMimeType("notes.txt", ""), "");
  assert.equal(inferMimeType("photo.heic", "image/jpeg"), "image/jpeg", "a real type always wins");
});

test("images are scaled to fit, never up", () => {
  assert.deepEqual(fitWithin(4032, 3024), { width: 2048, height: 1536 });
  assert.deepEqual(fitWithin(3024, 4032), { width: 1536, height: 2048 });
  assert.deepEqual(fitWithin(800, 600), { width: 800, height: 600 });
});

test("share point hints follow the server status", () => {
  const s = { points: 25, without_photo: "needs_photo" as const, with_photo: "eligible" as const };
  assert.equal(sharePointsHint(s, false).tone, "info");
  assert.match(sharePointsHint(s, false).text, /Add a photo/);
  assert.equal(sharePointsHint(s, true).tone, "earn");
  assert.equal(sharePointsHint(null, true).tone, "none");
  assert.equal(sharePointsHint({ points: 25, without_photo: "already_rewarded", with_photo: "already_rewarded" }, true).tone, "info");
});
