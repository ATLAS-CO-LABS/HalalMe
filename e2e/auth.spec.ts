import { test, expect } from "@playwright/test";
import { hasTestAccount, loginAsTestUser } from "./fixtures";

test.describe("Auth", () => {
  test("login page renders", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /welcome/i })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
  });

  test("invalid credentials show an error and stay on /login", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(`e2e-nonexistent-${Date.now()}@example.com`);
    await page.getByLabel("Password", { exact: true }).fill("WrongPassword123");
    await page.getByRole("button", { name: "Sign In" }).click();
    // LoginForm renders its error in a `.text-red-300` box — see src/components/auth/LoginForm.tsx.
    await expect(page.locator(".text-red-300")).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("signup rejects mismatched passwords before hitting the server", async ({ page }) => {
    await page.goto("/signup");
    await page.getByLabel("Full Name").fill("E2E Test User");
    await page.getByLabel("Email").fill(`e2e-mismatch-${Date.now()}@example.com`);
    await page.getByLabel("Password", { exact: true }).fill("Passw0rd1");
    await page.getByLabel("Confirm Password").fill("Different0rd");
    await page.getByLabel(/I agree to the/).check();
    await page.getByRole("button", { name: "Create Account" }).click();
    await expect(page.getByText("Passwords do not match")).toBeVisible();
    await expect(page).toHaveURL(/\/signup/);
  });

  test("valid signup reaches OTP verification", async ({ page }) => {
    // A fresh, never-reused address — this is a real signup against production.
    // Left unconfirmed on purpose: migration 040's nightly cleanup-unconfirmed-users
    // cron sweeps any auth.users row that never confirms within 24h, and no
    // `profiles` row is created until confirmation (see handle_new_user()).
    const email = `e2e-signup-${Date.now()}@example.com`;
    await page.goto("/signup");
    await page.getByLabel("Full Name").fill("E2E Test User");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("Passw0rd1");
    await page.getByLabel("Confirm Password").fill("Passw0rd1");
    await page.getByLabel(/I agree to the/).check();
    await page.getByRole("button", { name: "Create Account" }).click();
    await page.waitForURL(/\/verify-otp/, { timeout: 15000 });
    expect(page.url()).toContain(encodeURIComponent(email));
  });

  test("logs in with the standing test account", async ({ page }) => {
    test.skip(!hasTestAccount, "E2E_USER_EMAIL / E2E_USER_PASSWORD not set — see e2e/README.md");
    await loginAsTestUser(page);
    await expect(page).not.toHaveURL(/\/login/);
  });
});
