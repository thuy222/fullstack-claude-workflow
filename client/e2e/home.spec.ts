import { test, expect } from "@playwright/test";

// Smoke e2e proving the Playwright stack works against the built app. The
// `write-test` skill generates feature flows in this same shape under `e2e/`.
// An anonymous visitor (no session) sees the EFKT welcome and a path to login.
test("home page shows the EFKT welcome for an anonymous visitor", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /welcome to efkt/i }),
  ).toBeVisible();
});

test("home page links an anonymous visitor to login", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: /log in/i })).toHaveAttribute(
    "href",
    /\/login/,
  );
});
