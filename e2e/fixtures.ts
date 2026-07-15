import { Page } from "@playwright/test";

// Credentials for a standing test account, created once via the real signup
// flow (see e2e/README.md). Never hardcode real credentials in spec files —
// they're passed as env vars so nothing here becomes a secret in git history.
export const E2E_USER_EMAIL = process.env.E2E_USER_EMAIL;
export const E2E_USER_PASSWORD = process.env.E2E_USER_PASSWORD;

/** Gates specs that require a logged-in user — they call test.skip(!hasTestAccount, …). */
export const hasTestAccount = Boolean(E2E_USER_EMAIL && E2E_USER_PASSWORD);

/** Logs in through the real UI (password mode) and waits for the redirect off /login. */
export async function loginAsTestUser(page: Page): Promise<void> {
  if (!E2E_USER_EMAIL || !E2E_USER_PASSWORD) {
    throw new Error("E2E_USER_EMAIL / E2E_USER_PASSWORD are not set");
  }
  await page.goto("/login");
  await page.getByLabel("Email").fill(E2E_USER_EMAIL);
  await page.getByLabel("Password", { exact: true }).fill(E2E_USER_PASSWORD);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 15000 });
}
