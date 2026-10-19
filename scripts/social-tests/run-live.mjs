/**
 * Live browser suite for HalalMe Social.
 *
 *   npm run build && npx next start -p 3100     (in another terminal)
 *   npm run test:social:live                     (BASE=http://localhost:3100 by default)
 *
 * Drives the real UI against the real Supabase project: the four post types,
 * recipe sharing + points, pasted-link navigation, photo upload, accepted
 * answers, editing, filters, end of feed, mobile layout and signed-out views.
 * 45 checks.
 *
 * Mints a throwaway user with the service role and deletes it in `finally`
 * (cascading its posts, recipes and ledger rows); uploaded test photos are
 * removed through the app's own /api/upload/delete. Posts it creates are on the
 * live feed for about a minute, tagged "E2E-<timestamp>".
 *
 * Screenshots land in node_modules/.cache/social-live (or the path in argv[2]).
 */
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import { readFileSync, mkdirSync } from "node:fs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const require = createRequire(`${ROOT}/package.json`);
const { createClient } = require("@supabase/supabase-js");
const { chromium } = require("@playwright/test");

const BASE = process.env.BASE ?? "http://localhost:3100";
const SHOTS = process.argv[2] ?? `${ROOT}/node_modules/.cache/social-live`;
mkdirSync(SHOTS, { recursive: true });

const env = {};
for (const name of [".env.local", ".env"]) {
  let raw; try { raw = readFileSync(`${ROOT}/${name}`, "utf8"); } catch { continue; }
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && env[m[1]] === undefined) env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
}
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const results = [];
const check = (name, ok, detail = "") => { results.push({ name, ok: !!ok, detail }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`); };
const shot = (page, name) => page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: false });

const ts = Date.now();
const TAG = `E2E-${ts}`;
const email = `social-verify-${ts}@example.invalid`;
const password = `Sv!${ts}x9Q`;
let userId = null;
const consoleErrors = [];

async function main() {
  // ---- Fixtures ------------------------------------------------------------
  const { data: created, error: cErr } = await admin.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { full_name: "Social Verify" },
  });
  if (cErr) throw cErr;
  userId = created.user.id;
  const username = `sv${String(ts).slice(-7)}`;
  await new Promise((r) => setTimeout(r, 800));
  const { error: pErr } = await admin.from("profiles").update({ username }).eq("id", userId);
  if (pErr) throw pErr;

  const ingredients = [
    { name: "Lamb shoulder", amount: "800", unit: "g" }, { name: "Basmati rice", amount: "400", unit: "g" },
    { name: "Onions", amount: "3", unit: "" }, { name: "Yoghurt", amount: "200", unit: "g" }, { name: "Saffron", amount: "1", unit: "pinch" },
  ];
  const { data: pub, error: r1 } = await admin.from("recipes").insert({
    user_id: userId, title: `${TAG} Lamb Biryani`, description: "Verification recipe", cuisine: "pakistani", difficulty: "medium",
    prep_time_mins: 20, cook_time_mins: 70, servings: 4, ingredients, instructions: [{ step: 1, text: "Cook it." }],
    is_published: true, is_ai_generated: false,
  }).select("id").single();
  if (r1) throw r1;
  const { data: ai, error: r2 } = await admin.from("recipes").insert({
    user_id: userId, title: `${TAG} AI Chicken Karahi`, ingredients: [{ name: "Chicken thighs" }, { name: "Tomatoes" }],
    instructions: [{ step: 1, text: "Cook it." }], is_published: false, is_ai_generated: true, servings: 2, cook_time_mins: 35,
  }).select("id").single();
  if (r2) throw r2;

  const { data: aiUploadPts } = await admin.from("reward_transactions").select("points").eq("user_id", userId).eq("reference_id", ai.id);
  check("AI recipe save earns no creation points", (aiUploadPts ?? []).length === 0);

  // ---- Browser -------------------------------------------------------------
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${e.message}`));
  page.on("response", (r) => { if (r.status() >= 400) consoleErrors.push(`HTTP ${r.status()} ${r.request().method()} ${r.url().slice(0, 160)}`); });

  try {
    await page.goto(`${BASE}/login`);
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(password);
    await page.locator("form button[type=submit]").click();
    await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 20000 });
    check("signed in", true, new URL(page.url()).pathname);

    const dialog = page.getByRole("dialog", { name: "Create post" });

    // A. Share own published recipe via deep link -> points
    await page.goto(`${BASE}/social/feed?compose=recipe&recipe=${pub.id}`);
    await dialog.waitFor({ timeout: 15000 });
    check("deep link opens composer on Recipe", (await dialog.getByRole("tab", { name: /Recipe/ }).getAttribute("aria-selected")) === "true");
    check("recipe preselected", await dialog.getByText(`${TAG} Lamb Biryani`).isVisible());
    await dialog.getByText("Sharing this earns you 25 points.").waitFor({ timeout: 10000 });
    check("points hint shown for own recipe", true);
    await shot(page, "01-composer-recipe");
    await dialog.getByLabel("Caption (optional)").fill(`${TAG} my family biryani, slow-cooked the old way`);
    await dialog.getByRole("button", { name: "Share recipe", exact: true }).click();
    await dialog.waitFor({ state: "hidden", timeout: 20000 });
    const pointsToast = page.getByText("Recipe shared. You earned 25 points.");
    check("points toast after share", await pointsToast.waitFor({ timeout: 10000 }).then(() => true, () => false));
    await page.waitForTimeout(400);
    await shot(page, "02-feed-after-recipe-share");
    const recipeCard = page.locator("article").filter({ hasText: `${TAG} my family biryani` }).first();
    check("recipe post shows recipe card link", await recipeCard.locator(`a[href="/kitchen/recipes/${pub.id}"]`).first().isVisible());
    check("recipe card shows ingredient preview", await recipeCard.getByText(/Lamb shoulder, Basmati rice/).isVisible());
    const { data: share } = await admin.from("reward_transactions").select("points").eq("user_id", userId).eq("action", "recipe_share").eq("reference_id", pub.id);
    check("ledger: recipe_share +25 recorded once", (share ?? []).length === 1 && share[0].points === 25);

    // B. General post with links + photo
    const jpegB64 = await page.evaluate(() => {
      const c = document.createElement("canvas"); c.width = 1600; c.height = 1200;
      const g = c.getContext("2d");
      const grad = g.createLinearGradient(0, 0, 1600, 1200); grad.addColorStop(0, "#c2410c"); grad.addColorStop(1, "#facc15");
      g.fillStyle = grad; g.fillRect(0, 0, 1600, 1200); g.fillStyle = "#fff"; g.font = "bold 120px sans-serif"; g.fillText("E2E plate", 420, 640);
      return c.toDataURL("image/jpeg", 0.9).split(",")[1];
    });
    await page.getByRole("button", { name: "Post", exact: true }).first().click();
    await dialog.waitFor();
    const text = `${TAG} link test: https://halalme.co.uk/kitchen/recipes/${pub.id} and https://example.com/halal-guide?x=1. Thanks @${username}!`;
    await dialog.getByPlaceholder("What's on your mind?").fill(text);
    await dialog.locator('input[type="file"]').setInputFiles({ name: "plate.jpg", mimeType: "image/jpeg", buffer: Buffer.from(jpegB64, "base64") });
    await dialog.getByText(/Preparing|%/).first().waitFor({ timeout: 5000 }).catch(() => {});
    await shot(page, "03-composer-uploading");
    await dialog.getByRole("button", { name: "Post", exact: true }).waitFor({ timeout: 60000 });
    await dialog.getByRole("button", { name: "Post", exact: true }).click();
    await dialog.waitFor({ state: "hidden", timeout: 20000 });
    const linkCard = page.locator("article").filter({ hasText: `${TAG} link test` }).first();
    await linkCard.waitFor({ timeout: 15000 });
    const internal = linkCard.locator(`a[href="/kitchen/recipes/${pub.id}"]`).first();
    check("pasted recipe URL is an internal <a>", await internal.isVisible());
    const ext = linkCard.locator('a[href="https://example.com/halal-guide?x=1"]');
    check("external URL opens in new tab safely", (await ext.getAttribute("target")) === "_blank" && /noopener/.test(await ext.getAttribute("rel") ?? ""));
    check("trailing period not swallowed into URL", (await ext.count()) === 1);
    check("@mention links to profile", await linkCard.locator(`a[href="/social/u/${username}"]`, { hasText: `@${username}` }).isVisible());
    check("linked recipe preview card shown", await linkCard.getByRole("link", { name: `View recipe: ${TAG} Lamb Biryani` }).isVisible());
    const imgSrc = await linkCard.locator("img").last().getAttribute("src");
    check("photo served from Cloudinary with resize transform", /res\.cloudinary\.com\/.+\/upload\/f_auto,q_auto,c_limit,w_1200\/.*halalme\/posts\//.test(imgSrc ?? ""), imgSrc?.slice(0, 90));
    const photo = linkCard.locator('img[src*="halalme/posts"]').first();
    await photo.waitFor({ timeout: 15000 });
    await page.waitForFunction((el) => el.complete && el.naturalHeight > 0, await photo.elementHandle(), { timeout: 15000 });
    const box = await photo.boundingBox();
    check("uploaded photo renders with real height", (box?.height ?? 0) > 100, `${Math.round(box?.height ?? 0)}px`);
    check("no 'new posts' pill for my own posts", (await page.getByRole("button", { name: /new posts?$/ }).count()) === 0);
    await page.mouse.move(2, 600);
    await page.waitForTimeout(300);
    const before = await linkCard.evaluate((el) => getComputedStyle(el).borderTopColor);
    await linkCard.hover({ position: { x: 20, y: 20 } });
    await page.waitForTimeout(300);
    const after = await linkCard.evaluate((el) => getComputedStyle(el).borderTopColor);
    check("post card border responds to hover", before !== after, `${before} -> ${after}`);
    await internal.hover();
    const hoverDeco = await internal.evaluate((el) => getComputedStyle(el).cursor);
    check("link shows pointer cursor on hover", hoverDeco === "pointer", hoverDeco);
    await shot(page, "04-link-post");
    const { data: mediaRow } = await admin.from("posts").select("id, media_urls, media_public_ids").eq("user_id", userId).ilike("content", `${TAG} link test%`).single();
    check("media URL stored in post's own folder", mediaRow?.media_urls?.[0]?.includes(`halalme/posts/${userId}/${mediaRow.id}/`));
    const { data: dims } = await admin.rpc("get_social_feed", { p_mode: "user", p_author_id: userId, p_limit: 5 });
    check("feed RPC returns the user's posts", (dims ?? []).length >= 2);

    // C. Click the pasted recipe link -> recipe page
    await internal.click();
    await page.waitForURL(`**/kitchen/recipes/${pub.id}`, { timeout: 15000 });
    check("clicking recipe link navigates to recipe", true);
    await page.goBack();
    await page.waitForURL("**/social/feed**");

    // D. Question
    await page.getByRole("button", { name: "Post", exact: true }).first().click();
    await dialog.waitFor();
    await dialog.getByRole("tab", { name: /Question/ }).click();
    await dialog.getByRole("button", { name: "Ask", exact: true }).click();
    check("question requires the question", await dialog.getByText(/at least 10 characters/).isVisible());
    await dialog.getByLabel("Your question").fill(`${TAG} Where can I buy halal gelatine in Leeds?`);
    await dialog.getByLabel("Details (optional)").fill("Need it for panna cotta this weekend.");
    await dialog.getByRole("button", { name: "Ask", exact: true }).click();
    await dialog.waitFor({ state: "hidden", timeout: 20000 });
    const qCard = page.locator("article").filter({ hasText: `${TAG} Where can I buy` }).first();
    check("question renders its title as a heading", await qCard.getByRole("heading", { name: /Where can I buy halal gelatine/ }).waitFor({ timeout: 10000 }).then(() => true, () => false));

    // E. Review
    await page.getByRole("button", { name: "Post", exact: true }).first().click();
    await dialog.waitFor();
    await dialog.getByRole("tab", { name: /Review/ }).click();
    await dialog.getByRole("button", { name: "Post review", exact: true }).click();
    check("review requires subject + rating", await dialog.getByText("Choose a star rating.").isVisible() && await dialog.getByText("Say what you're reviewing.").isVisible());
    await dialog.getByLabel("What are you reviewing?").fill(`${TAG} Grill House Bradford`);
    await dialog.getByRole("radio", { name: /3 stars/ }).focus();
    await page.keyboard.press("ArrowRight");
    check("star rating works from the keyboard", (await dialog.getByRole("radio", { name: /4 stars/ }).getAttribute("aria-checked")) === "true");
    await dialog.getByLabel("Your review").fill("Brilliant mixed grill, friendly staff and HMC certificate on the wall.");
    const amber = await page.evaluate(() => { const d = document.createElement("div"); d.style.color = "var(--hm-amber)"; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; });
    await page.waitForTimeout(400); // border colour transition
    const focusedBorder = await dialog.getByLabel("Your review").evaluate((el) => getComputedStyle(el).borderTopColor);
    check("focused input shows the amber focus border", focusedBorder === amber, `${focusedBorder} vs ${amber}`);
    await shot(page, "05-composer-review");
    await dialog.getByRole("button", { name: "Post review", exact: true }).click();
    await dialog.waitFor({ state: "hidden", timeout: 20000 });
    const rCard = page.locator("article").filter({ hasText: `${TAG} Grill House` }).first();
    check("review shows rating", await rCard.getByRole("img", { name: "Rated 4 out of 5" }).isVisible());

    // F. AI draft without a photo -> allowed, no points
    await page.goto(`${BASE}/social/feed?compose=recipe&recipe=${ai.id}`);
    await dialog.waitFor({ timeout: 15000 });
    check("AI recipe hint asks for a photo", await dialog.getByText(/Add a photo of your dish to earn 25 points/).waitFor({ timeout: 10000 }).then(() => true, () => false));
    check("draft note shown", await dialog.getByText(/This recipe is a draft/).isVisible());
    await dialog.getByRole("button", { name: "Share recipe", exact: true }).click();
    await dialog.waitFor({ state: "hidden", timeout: 20000 });
    const { data: aiShare } = await admin.from("reward_transactions").select("points").eq("user_id", userId).eq("action", "recipe_share").eq("reference_id", ai.id);
    check("AI recipe shared without photo earns nothing", (aiShare ?? []).length === 0);

    // G. Reshare same recipe -> no second award
    await page.goto(`${BASE}/social/feed?compose=recipe&recipe=${pub.id}`);
    await dialog.waitFor({ timeout: 15000 });
    check("reshare hint says already rewarded", await dialog.getByText("You've already earned points for sharing this recipe.").waitFor({ timeout: 10000 }).then(() => true, () => false));
    await dialog.getByRole("button", { name: "Close" }).click();
    await page.waitForTimeout(300);

    // H. Question detail: answer + accept
    await page.goto(`${BASE}/social/feed?tab=latest`);
    const q2 = page.locator("article").filter({ hasText: `${TAG} Where can I buy` }).first();
    await q2.waitFor({ timeout: 15000 });
    await q2.locator('a[href^="/social/post/"]').first().click();
    await page.waitForURL("**/social/post/**");
    await page.getByLabel("Write an answer").fill("Try the Turkish grocer on Harehills Road, they stock beef gelatine.");
    await page.getByRole("button", { name: "Post answer" }).click();
    await page.getByRole("button", { name: "Accept answer" }).click();
    check("owner can accept an answer", await page.getByText("Accepted answer").waitFor({ timeout: 10000 }).then(() => true, () => false));
    await page.waitForTimeout(3000);
    check("accepted state survives the background refresh", await page.getByText("Accepted answer").isVisible() && await page.getByRole("button", { name: "Unmark answer" }).isVisible());
    const { data: qRow } = await admin.from("posts").select("accepted_comment_id").eq("user_id", userId).eq("post_type", "question").single();
    check("accepted answer persisted", !!qRow?.accepted_comment_id);
    await shot(page, "06-question-detail");

    // I. Edit a post
    await page.goto(`${BASE}/social/feed?tab=latest`);
    const editCard = page.locator("article").filter({ hasText: `${TAG} link test` }).first();
    await editCard.waitFor({ timeout: 15000 });
    await editCard.getByRole("button", { name: "Post options" }).click();
    await editCard.getByRole("menuitem", { name: "Edit Post" }).click();
    const editDialog = page.getByRole("dialog", { name: "Edit post" });
    await editDialog.locator("textarea").fill(`${TAG} link test (edited) https://halalme.co.uk/kitchen/recipes/${pub.id}`);
    await editDialog.getByRole("button", { name: "Save" }).click();
    await editDialog.waitFor({ state: "hidden", timeout: 15000 });
    check("edit saved and still linkified", await page.locator("article").filter({ hasText: "(edited)" }).locator(`a[href="/kitchen/recipes/${pub.id}"]`).first().isVisible());

    // J. Menu closes on outside click
    await editCard.getByRole("button", { name: "Post options" }).click();
    await page.mouse.click(5, 400);
    await page.waitForTimeout(400); // exit animation
    check("options menu closes on outside click", (await page.getByRole("menu").count()) === 0);

    // K. Filters + tabs + end of feed
    await page.getByRole("button", { name: "Reviews", exact: true }).click();
    await page.waitForTimeout(1500);
    const nonReviews = await page.locator("article").evaluateAll((els) => els.filter((e) => !e.textContent.includes("Review")).length);
    check("Reviews filter shows only reviews", nonReviews === 0, `${nonReviews} non-review cards`);
    await page.getByRole("button", { name: "All", exact: true }).click();
    await page.getByRole("tab", { name: /For You/ }).click();
    await page.waitForTimeout(1500);
    await shot(page, "07-for-you");
    for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, 5000); await page.waitForTimeout(500); }
    check("end-of-feed state shown", await page.getByText("You're all caught up").isVisible());
    const hrefs = await page.locator("article").evaluateAll((els) => els.map((e) => e.querySelector('a[href^="/social/post/"]')?.getAttribute("href")));
    check("no duplicate posts in feed", new Set(hrefs).size === hrefs.length, `${hrefs.length} cards`);

    // L. Mobile
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE}/social/feed?tab=latest`);
    await page.locator("article").first().waitFor({ timeout: 15000 });
    await shot(page, "08-mobile-feed");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    check("no horizontal overflow on mobile", !overflow);
    await page.getByRole("button", { name: "Post", exact: true }).first().click();
    await dialog.waitFor();
    await dialog.getByRole("tab", { name: /Recipe/ }).click();
    await page.waitForTimeout(800);
    const closeBtn = dialog.getByRole("button", { name: "Close" });
    const cb = await closeBtn.boundingBox();
    const topEl = await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest('[role="dialog"]') !== null, [cb.x + cb.width / 2, cb.y + cb.height / 2]);
    check("mobile composer sits above the site header", topEl);
    await shot(page, "09-mobile-composer-recipe");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

    // M. Signed-out visitor
    const anon = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const ap = await anon.newPage();
    ap.on("pageerror", (e) => consoleErrors.push(`anon pageerror: ${e.message}`));
    const { data: recipePost } = await admin.from("posts").select("id").eq("user_id", userId).eq("recipe_id", pub.id).limit(1).single();
    await ap.goto(`${BASE}/social/post/${recipePost.id}`);
    check("signed-out post page shows recipe card", await ap.getByRole("link", { name: `View recipe: ${TAG} Lamb Biryani` }).waitFor({ timeout: 15000 }).then(() => true, () => false));
    await ap.screenshot({ path: `${SHOTS}/10-anon-recipe-post.png` });
    await ap.getByRole("button", { name: "Post", exact: true }).count();
    await ap.goto(`${BASE}/social/feed`);
    await ap.locator("article").first().waitFor({ timeout: 15000 });
    check("signed-out feed renders", true);
    await anon.close();

    // Cleanup media through the app's own route (ownership-checked).
    const { data: mine } = await admin.from("posts").select("media_urls, media_public_ids").eq("user_id", userId);
    const ids = (mine ?? []).flatMap((p) => p.media_public_ids ?? []);
    const urls = (mine ?? []).flatMap((p) => p.media_urls ?? []);
    if (ids.length) {
      const res = await page.evaluate(async ([i, u]) => (await fetch("/api/upload/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ public_ids: i, media_urls: u }) })).json(), [ids, urls]);
      check("Cloudinary test media deleted", res.deleted === ids.length, JSON.stringify(res));
    }
  } catch (err) {
    await shot(page, "zz-failure").catch(() => {});
    throw err;
  } finally {
    await browser.close();
  }
}

try {
  await main();
} catch (err) {
  console.error("ERROR", err);
  results.push({ name: "script completed", ok: false, detail: String(err?.message ?? err) });
} finally {
  if (userId) {
    const { error } = await admin.auth.admin.deleteUser(userId);
    const { count } = await admin.from("posts").select("id", { count: "exact", head: true }).eq("user_id", userId);
    console.log(error ? `CLEANUP FAILED: ${error.message}` : `cleanup: user deleted, ${count ?? 0} posts left`);
  }
  const relevant = consoleErrors.filter((e) => !/favicon|Download the React DevTools|vercel|_vercel|speed-insights|sentry|Failed to load resource/i.test(e));
  console.log(`\nconsole errors / failed requests (${relevant.length}):\n${[...new Set(relevant)].slice(0, 25).join("\n")}`);
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  process.exit(failed.length ? 1 : 0);
}
