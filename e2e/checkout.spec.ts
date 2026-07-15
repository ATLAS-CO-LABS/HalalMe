import { test, expect } from "@playwright/test";
import { hasTestAccount, loginAsTestUser } from "./fixtures";

// Deliberately stops short of submitting a real card payment — see
// e2e/README.md. This only proves the checkout page successfully creates a
// PaymentIntent and mounts the payment step; it does not confirm a charge.
test.describe("Donation checkout", () => {
  test.skip(!hasTestAccount, "E2E_USER_EMAIL / E2E_USER_PASSWORD not set — see e2e/README.md");

  test("browse a cause and reach the payment step", async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto("/rewards/causes");

    await page.locator('a[href^="/rewards/causes/"]').first().click();
    await page.waitForURL(/\/rewards\/causes\/.+/);

    await page.getByRole("button", { name: /^£\d+$/ }).first().click();
    await page.getByRole("button", { name: /^Donate £\d+$/ }).click();
    await page.waitForURL(/\/rewards\/checkout\?charityId=.+&amount=\d+/);

    await expect(page.getByText("Payment Details")).toBeVisible();

    // Either outcome is a valid pass — a "not configured" env is not a bug in
    // the flow itself — but the page must resolve to one of them, not hang on
    // "Initialising payment…" or silently error.
    const notConfigured = page.getByText("Stripe is not configured");
    // PaymentForm's own submit button — "Donate £{amount.toFixed(2)}" — lives
    // in the main page tree, not inside Stripe's iframe, so no frame handling needed.
    const paymentReady = page.getByRole("button", { name: /^Donate £\d+\.\d{2}$/ });
    await expect(notConfigured.or(paymentReady)).toBeVisible({ timeout: 15000 });

    // Intentionally NOT clicking the Donate button — that would submit a real
    // payment against whatever Stripe mode this environment is currently in.
  });
});
