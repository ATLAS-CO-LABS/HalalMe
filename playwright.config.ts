import { defineConfig, devices } from "@playwright/test";

// E2E suite for critical user flows (auth, donation checkout, Hub posting).
// Runs against a real deployed URL (default: production) — see e2e/README.md
// before running anything that mutates data (signup, posting, checkout).
const BASE_URL = process.env.E2E_BASE_URL ?? "https://halalme.co.uk";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // hitting a real deployment — avoid piling on concurrent load
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
