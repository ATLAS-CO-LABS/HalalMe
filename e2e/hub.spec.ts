import { test, expect } from "@playwright/test";
import { hasTestAccount, loginAsTestUser } from "./fixtures";

// This suite posts to the real, publicly-visible Hub feed on production and
// deletes what it created afterward — see e2e/README.md before running it.
test.describe("Hub posting", () => {
  test.skip(!hasTestAccount, "E2E_USER_EMAIL / E2E_USER_PASSWORD not set — see e2e/README.md");

  test("create a post, see it in the feed, then delete it", async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto("/hub/feed");

    const content = `E2E test post ${Date.now()} — safe to ignore/delete`;

    // Header "Post" button opens CreatePostModal; its own submit button is also
    // labelled "Post" and is rendered after the header in the DOM, so .last()
    // reliably targets the modal's button rather than the one that opened it.
    await page.getByRole("button", { name: "Post", exact: true }).first().click();
    await page.getByPlaceholder("What's on your mind?").fill(content);
    await page.getByRole("button", { name: "Post", exact: true }).last().click();

    await expect(page.getByText(content)).toBeVisible({ timeout: 15000 });

    // This is a real, live social feed — other users can post concurrently and
    // shift the ordering, so don't assume ours is "the first card" (that raced
    // and once clicked a stranger's menu instead of ours). Anchor directly on
    // our unique post text and walk up to its own card — the closest ancestor
    // that has a "Post options" button — regardless of list position.
    const card = page.locator(
      `xpath=//p[contains(text(), ${JSON.stringify(content)})]/ancestor::div[.//button[@aria-label="Post options"]][1]`,
    );
    await card.getByRole("button", { name: "Post options" }).click();
    await card.getByRole("button", { name: "Delete Post" }).click();

    // The feed removes the card optimistically before the DELETE request
    // resolves (see handleDeletePost in src/app/hub/feed/page.tsx), so a DOM
    // check alone would pass instantly regardless of whether the delete
    // actually reached the server — and Playwright could tear down the page
    // right after, aborting the in-flight request. Wait for the real response
    // so this test proves the post is actually gone, not just optimistically hidden.
    const deleteResponse = page.waitForResponse(
      (res) => res.url().includes("/rest/v1/posts") && res.request().method() === "DELETE",
    );
    await card.getByRole("button", { name: "Delete", exact: true }).click();
    const res = await deleteResponse;
    expect(res.ok()).toBe(true);

    await expect(page.getByText(content)).toHaveCount(0, { timeout: 10000 });
  });
});
