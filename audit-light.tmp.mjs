import { chromium } from "playwright";
const SHOT_DIR = "C:/Users/MUAZAM~1/AppData/Local/Temp/claude/c--PROJECTS-halalme/1e231b4d-62bb-4918-9773-08816f4c6f0d/scratchpad/shots";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });

async function toLight() {
  const lightToggle = page.getByRole("button", { name: /switch to light mode/i });
  const alreadyLight = await page.getByRole("button", { name: /switch to dark mode/i }).count();
  if (alreadyLight > 0) return; // already in light mode (persisted from a previous nav)
  await lightToggle.waitFor({ timeout: 5000 });
  await lightToggle.click();
  await page.waitForTimeout(300);
}

async function fullScroll(prefix, maxScroll, step = 900) {
  for (let y = 0; y <= maxScroll; y += step) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${SHOT_DIR}/${prefix}-${String(y).padStart(5, "0")}.png` });
  }
}

await page.goto("http://localhost:3000/hub", { waitUntil: "networkidle" });
await toLight();
const hubHeight = await page.evaluate(() => document.body.scrollHeight);
console.log("hub height:", hubHeight);
await fullScroll("audit-hub", hubHeight);

await page.goto("http://localhost:3000/kitchen", { waitUntil: "networkidle" });
await toLight();
const kitchenHeight = await page.evaluate(() => document.body.scrollHeight);
console.log("kitchen height:", kitchenHeight);
await fullScroll("audit-kitchen", kitchenHeight);

await browser.close();
console.log("done");
