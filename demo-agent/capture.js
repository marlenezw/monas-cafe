// Captures the menu board headlessly. The agent calls this via the
// capture_menu tool — no human ever sees a browser window.
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const BASE = process.env.CAFE_URL || "http://127.0.0.1:4173";

async function captureMenu(label, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, `${label}.png`);

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2,
  });

  await page.goto(`${BASE}/menu.html`);
  await page.waitForLoadState("networkidle");
  await page.waitForSelector(".board .price");

  const prices = await page.$$eval(".price", (els) =>
    els.map((e) => e.textContent.trim())
  );
  const total = await page
    .$eval("#grand-total", (e) => e.textContent.trim())
    .catch(() => null);

  await page.locator(".board").screenshot({ path: out });
  await browser.close();

  const broken = prices.filter((p) => p.includes("NaN")).length;
  return { path: out, prices, total, broken, healthy: broken === 0 };
}

module.exports = { captureMenu };

if (require.main === module) {
  const [label, outDir] = process.argv.slice(2);
  captureMenu(label || "capture", outDir || "evidence")
    .then((r) => console.log(JSON.stringify(r, null, 2)))
    .catch((e) => {
      console.error(e.message);
      process.exit(1);
    });
}
