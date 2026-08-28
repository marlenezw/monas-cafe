import { test, expect } from "@playwright/test";
import fs from "node:fs";

const SHOTS = "test-results/screenshots";

test.beforeAll(() => {
  fs.mkdirSync(SHOTS, { recursive: true });
});

test("menu prices render as currency, not NaN", async ({ page }) => {
  await page.goto("/menu.html");
  await page.waitForLoadState("networkidle");

  // Capture the board regardless of outcome — this is the artifact we attach.
  await page.screenshot({ path: `${SHOTS}/menu-prices.png`, fullPage: true });

  const prices = await page.locator(".price").allInnerTexts();
  const broken = prices.filter((p) => p.includes("NaN"));

  expect(
    broken,
    `${broken.length} of ${prices.length} prices failed to parse`
  ).toHaveLength(0);
});

test("order total is a valid currency amount", async ({ page }) => {
  await page.goto("/menu.html");
  await page.waitForLoadState("networkidle");

  const total = page.locator("#grand-total");
  await expect(total).toBeVisible();

  await total.screenshot({ path: `${SHOTS}/order-total.png` });

  await expect(total).toHaveText(/^\$\d+\.\d{2}$/);
});

test("no pricing errors are logged to the console", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  await page.goto("/menu.html");
  await page.waitForLoadState("networkidle");

  expect(errors, errors.join("\n")).toHaveLength(0);
});
