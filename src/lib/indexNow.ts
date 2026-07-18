const INDEXNOW_KEY = "832193f8618fea4cbd566d44f87a576e06c7069d6ed13f30eb75c78cf1a55c76";
const HOST = "halalme.co.uk";
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

/**
 * Pushes new/changed URLs to IndexNow (Bing, Yandex) so they get crawled
 * without waiting for a scheduled crawl. Best-effort — call without awaiting;
 * failures are logged, never thrown, matching the fire-and-forget mutation
 * pattern used elsewhere (e.g. view-count increments).
 */
export async function pingIndexNow(urls: string[]): Promise<void> {
  if (urls.length === 0 || process.env.NODE_ENV !== "production") return;

  try {
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: KEY_LOCATION,
        urlList: urls,
      }),
    });
  } catch (err) {
    console.error("[indexNow] submission failed", err);
  }
}
