import { test, expect } from "@playwright/test";

test.describe("Java mobile ordering", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto("/menu.html");
  });

  test("customizes price and adds the configured drink", async ({ page }) => {
    await page.locator("[name='size'][value='large']").check();
    await page.locator("[name='milk'][value='oat']").check();
    await page.locator("[data-addon]").click();
    await page.locator("[data-increase]").click();

    await expect(page.locator("[data-total-price]")).toHaveText("$16.00");
    await expect(page.locator("[data-summary]")).toContainText(
      "Large · Oat milk · Extra shot"
    );

    await page.locator("[data-order]").click();
    await expect(page.locator("[data-toast]")).toHaveClass(/show/);
    await expect(page.locator("[data-toast-summary]")).toContainText(
      "2 House Lattes · $16.00"
    );
  });

  test("keeps the instructions field and counter clear of the order bar", async ({
    page
  }) => {
    const notes = page.locator(".notes-field");
    await notes.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const overlap = await notes.evaluate((field) => {
      const bar = document.querySelector(".order-bar")!.getBoundingClientRect();
      const fieldRect = field.getBoundingClientRect();
      return Math.max(0, fieldRect.bottom - bar.top);
    });

    expect(overlap).toBe(0);
  });

  test("keeps Special instructions clear of the order bar (PR 1 baseline: 59px overlap)", async ({
    page
  }) => {
    const instructions = page.locator("[name='notes']");
    await instructions.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const overlap = await instructions.evaluate((textarea) => {
      const bar = document.querySelector(".order-bar")!.getBoundingClientRect();
      const textareaRect = textarea.getBoundingClientRect();
      return Math.round(Math.max(0, textareaRect.bottom - bar.top));
    });
    const expectedOverlapPx = 0;
    const documentedBaselineOverlapPx = 59;

    expect(
      overlap,
      `The Special instructions textarea must leave ${expectedOverlapPx}px ` +
        `overlap with the fixed Add to order bar. PR 1 documents the prior ` +
        `${documentedBaselineOverlapPx}px baseline overlap.`
    ).toBe(expectedOverlapPx);
  });

  test("demo route frames the mobile app", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/demo.html");

    await expect(page.locator(".phone")).toBeVisible();
    await expect(page.locator("iframe")).toHaveAttribute(
      "src",
      "menu.html?showIssue=1"
    );
    await expect(page.locator("[data-issue-marker]")).toContainText(
      "59px overlap"
    );

    const app = page.frames().find((frame) =>
      frame.url().endsWith("/menu.html?showIssue=1")
    );
    expect(app).toBeDefined();
    await expect
      .poll(() =>
        app!.evaluate(
          () =>
            document.documentElement.scrollHeight -
            window.innerHeight -
            window.scrollY
        )
      )
      .toBeLessThan(2);
    await expect(app!.locator(".notes-field")).toBeVisible();
    const overlap = await app!.locator(".notes-field").evaluate((field) => {
      const bar = document.querySelector(".order-bar")!.getBoundingClientRect();
      return Math.round(
        Math.max(0, field.getBoundingClientRect().bottom - bar.top)
      );
    });
    expect(overlap).toBe(0);
  });
});
