import { test, expect, type Page, type Locator } from "@playwright/test";
import { hasTestAccount, loginAsTestUser } from "./fixtures";

// This suite posts to the real, publicly-visible Social feed and deletes what
// it created afterwards. See e2e/README.md before running it.
//
// Needs migrations 075 + 076 applied on the target environment (typed post
// fields, validate_post). Run it against a preview deployment first.

const stamp = () => `E2E ${Date.now()}`;

/** The <article> that holds a post whose text contains `text`. */
function cardWith(page: Page, text: string): Locator {
  return page.locator("article").filter({ hasText: text }).first();
}

async function openComposer(page: Page) {
  await page.goto("/social/feed?tab=latest");
  await page.getByRole("button", { name: "Post", exact: true }).first().click();
  await expect(page.getByRole("dialog", { name: "Create post" })).toBeVisible();
}

async function submit(page: Page, label: string) {
  await page.getByRole("dialog", { name: "Create post" }).getByRole("button", { name: label, exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Create post" })).toBeHidden({ timeout: 15000 });
}

async function deletePost(page: Page, card: Locator) {
  await card.getByRole("button", { name: "Post options" }).click();
  await card.getByRole("menuitem", { name: "Delete Post" }).click();
  // The feed hides the card optimistically and sends the DELETE after the undo
  // window, so wait for the real response: that's what proves it's gone.
  const deleted = page.waitForResponse(
    (res) => res.url().includes("/rest/v1/posts") && res.request().method() === "DELETE",
    { timeout: 15000 },
  );
  await page.getByRole("alertdialog").getByRole("button", { name: "Delete", exact: true }).click();
  expect((await deleted).ok()).toBe(true);
}

test.describe("Social posting", () => {
  test.skip(!hasTestAccount, "E2E_USER_EMAIL / E2E_USER_PASSWORD not set (see e2e/README.md)");
  test.beforeEach(async ({ page }) => { await loginAsTestUser(page); });

  test("a text post is created, shown, and deleted", async ({ page }) => {
    const content = `${stamp()} text post, safe to ignore`;
    await openComposer(page);
    await page.getByPlaceholder("What's on your mind?").fill(content);
    await submit(page, "Post");

    const card = cardWith(page, content);
    await expect(card).toBeVisible({ timeout: 15000 });
    await deletePost(page, card);
    await expect(page.getByText(content)).toHaveCount(0, { timeout: 10000 });
  });

  test("a recipe link in a post is a real, working link", async ({ page }) => {
    // Find any published recipe to link to.
    await page.goto("/kitchen/recipes");
    const first = page.locator('a[href^="/kitchen/recipes/"]').filter({ hasNotText: "Upload" }).first();
    const href = await first.getAttribute("href");
    test.skip(!href || !/\/kitchen\/recipes\/[0-9a-f-]{36}/.test(href), "No published recipe to link to");
    const recipePath = href!.match(/\/kitchen\/recipes\/[0-9a-f-]{36}/)![0];

    // The card shows a shortened URL label, so find it by the unique tag.
    const tag = stamp();
    await openComposer(page);
    await page.getByPlaceholder("What's on your mind?").fill(`${tag} link test https://halalme.co.uk${recipePath} done`);
    await submit(page, "Post");

    const card = cardWith(page, tag);
    await expect(card).toBeVisible({ timeout: 15000 });

    // The URL renders as an in-app link, not text: it has an href, takes
    // focus and responds to hover.
    const link = card.locator(`a[href="${recipePath}"]`).first();
    await expect(link).toBeVisible();
    await link.hover();
    await link.focus();
    await expect(link).toBeFocused();

    // A link preview card for the recipe is shown too.
    await expect(card.getByRole("link", { name: /View recipe:/ })).toBeVisible();

    await link.click();
    await expect(page).toHaveURL(new RegExp(`${recipePath}$`));

    await page.goBack();
    await deletePost(page, cardWith(page, tag));
  });

  test("Question and Review have their own fields and validation", async ({ page }) => {
    await openComposer(page);
    const dialog = page.getByRole("dialog", { name: "Create post" });

    // Question: the question itself is required, 10+ characters.
    await dialog.getByRole("tab", { name: /Question/ }).click();
    await dialog.getByRole("button", { name: "Ask", exact: true }).click();
    await expect(dialog.getByText(/at least 10 characters/)).toBeVisible();

    // Review: subject, rating and text are all required.
    await dialog.getByRole("tab", { name: /Review/ }).click();
    await dialog.getByRole("button", { name: "Post review", exact: true }).click();
    await expect(dialog.getByText("Say what you're reviewing.")).toBeVisible();
    await expect(dialog.getByText("Choose a star rating.")).toBeVisible();

    // Recipe: a recipe must be chosen.
    await dialog.getByRole("tab", { name: /Recipe/ }).click();
    await dialog.getByRole("button", { name: "Share recipe", exact: true }).click();
    await expect(dialog.getByText("Choose a recipe to share.")).toBeVisible();

    // A complete review posts and shows its subject and rating.
    const subject = `${stamp()} Grill House`;
    await dialog.getByRole("tab", { name: /Review/ }).click();
    await dialog.getByLabel("What are you reviewing?").fill(subject);
    await dialog.getByRole("radio", { name: /4 stars/ }).click();
    await dialog.getByLabel("Your review").fill("Great mixed grill and friendly staff. E2E, safe to ignore.");
    await submit(page, "Post review");

    const card = cardWith(page, subject);
    await expect(card).toBeVisible({ timeout: 15000 });
    await expect(card.getByRole("img", { name: "Rated 4 out of 5" })).toBeVisible();
    await deletePost(page, card);
  });
});

test.describe("Social feed (signed out)", () => {
  test("feed loads, paginates without duplicates, and ends cleanly", async ({ page }) => {
    await page.goto("/social/feed?tab=latest");
    await expect(page.getByRole("tab", { name: /Latest/ })).toHaveAttribute("aria-selected", "true");

    // Scroll until the end-of-feed message or a sensible cap.
    for (let i = 0; i < 8; i++) {
      if (await page.getByText("You're all caught up").isVisible()) break;
      await page.mouse.wheel(0, 4000);
      await page.waitForTimeout(800);
    }

    const ids = await page.locator("article").evaluateAll((els) =>
      els.map((el) => el.querySelector('a[href^="/social/post/"]')?.getAttribute("href")).filter(Boolean),
    );
    expect(new Set(ids).size).toBe(ids.length);
  });
});
