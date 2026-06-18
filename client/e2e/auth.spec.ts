import { test, expect, type Page } from "@playwright/test";

// E2e for the auth flows. The NestJS backend is NOT run here — every `/auth/*`
// call is intercepted with `page.route` and answered with canned JSON, so the
// flows are deterministic and client-only. Token storage is localStorage
// (`auth_token`).
// Traces: specs/authentication.md §9 (AC-4, AC-5, AC-8, AC-9) and the
// "already-logged-in" edge case (§8).

const USER = {
  id: "user-1",
  email: "ada@example.com",
  name: "Ada",
  createdAt: "2026-06-18T10:00:00.000Z",
};

const TOKEN_KEY = "auth_token";

async function json(
  route: Parameters<Parameters<Page["route"]>[1]>[0],
  status: number,
  body: unknown,
) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

// Seed a logged-in session before any page script runs.
async function seedSession(page: Page) {
  await page.addInitScript(
    ([key, token]) => window.localStorage.setItem(key, token),
    [TOKEN_KEY, "tok-existing"],
  );
}

test.describe("Authentication", () => {
  // AC-8 (success) + US-3: register → land on "/", session survives a reload.
  test("registers, lands on the home page, and keeps the session after reload", async ({
    page,
  }) => {
    await page.route("**/auth/register", (route) =>
      json(route, 201, { accessToken: "tok-new", user: USER }),
    );
    await page.route("**/auth/me", (route) => json(route, 200, { user: USER }));

    await page.goto("/register");
    await page.getByLabel(/email/i).fill("ada@example.com");
    await page.getByLabel(/password/i).fill("correct horse battery");
    await page.getByLabel(/name/i).fill("Ada");
    await page
      .getByRole("button", { name: /create account|register|sign up/i })
      .click();

    await expect(page).toHaveURL("/");

    await page.reload();
    await expect(page.getByRole("button", { name: /log out/i })).toBeVisible();
  });

  // AC-4 + AC-8: login with valid credentials → redirect to "/".
  test("logs in with valid credentials and redirects home", async ({ page }) => {
    await page.route("**/auth/login", (route) =>
      json(route, 200, { accessToken: "tok-login", user: USER }),
    );
    await page.route("**/auth/me", (route) => json(route, 200, { user: USER }));

    await page.goto("/login");
    await page.getByLabel(/email/i).fill("ada@example.com");
    await page.getByLabel(/password/i).fill("correct horse battery");
    await page.getByRole("button", { name: /log in/i }).click();

    await expect(page).toHaveURL("/");
  });

  // AC-8, FR-ui.3: invalid input shows inline errors and sends no request.
  test("shows inline validation errors and makes no network call", async ({
    page,
  }) => {
    let loginCalls = 0;
    await page.route("**/auth/login", (route) => {
      loginCalls += 1;
      return json(route, 200, { accessToken: "x", user: USER });
    });

    await page.goto("/login");
    await page.getByLabel(/email/i).fill("not-an-email");
    await page.getByLabel(/password/i).fill("correct horse battery");
    await page.getByRole("button", { name: /log in/i }).click();

    await expect(page.getByText(/valid email/i)).toBeVisible();
    await expect(page).toHaveURL("/login");
    expect(loginCalls).toBe(0);
  });

  // AC-5: invalid credentials → top-level error, stays on /login.
  test("shows a top-level error on invalid credentials", async ({ page }) => {
    await page.route("**/auth/login", (route) =>
      json(route, 401, {
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Email or password is incorrect.",
        },
      }),
    );

    await page.goto("/login");
    await page.getByLabel(/email/i).fill("ada@example.com");
    await page.getByLabel(/password/i).fill("wrong-password");
    await page.getByRole("button", { name: /log in/i }).click();

    await expect(page.getByText(/incorrect/i)).toBeVisible();
    await expect(page).toHaveURL("/login");
  });

  // AC-9, FR-logout.1/FR-ui.6: logout clears the session and redirects to /login.
  test("logs out and redirects to /login", async ({ page }) => {
    await seedSession(page);
    await page.route("**/auth/me", (route) => json(route, 200, { user: USER }));

    await page.goto("/");
    const logout = page.getByRole("button", { name: /log out/i });
    await expect(logout).toBeVisible();
    await logout.click();

    await expect(page).toHaveURL("/login");
    const token = await page.evaluate(
      (key) => window.localStorage.getItem(key),
      TOKEN_KEY,
    );
    expect(token).toBeNull();
  });

  // Edge (§8): an already-authenticated user visiting /login is sent home.
  test("redirects an already-logged-in user away from /login", async ({
    page,
  }) => {
    await seedSession(page);
    await page.route("**/auth/me", (route) => json(route, 200, { user: USER }));

    await page.goto("/login");

    await expect(page).toHaveURL("/");
  });
});
