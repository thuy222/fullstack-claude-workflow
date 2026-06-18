import { test, expect } from "@playwright/test";

// Smoke e2e proving the Playwright stack works against the built app. The
// `write-test` skill generates feature flows in this same shape under `e2e/`.
test("home page shows the getting-started heading", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /to get started/i }),
  ).toBeVisible();
});

test("documentation link points to the Next.js docs", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "Documentation" })).toHaveAttribute(
    "href",
    /nextjs\.org\/docs/,
  );
});
