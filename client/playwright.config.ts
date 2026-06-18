import { defineConfig, devices } from "@playwright/test";

// Playwright e2e setup. Follows the bundled Next.js 16 guide:
// node_modules/next/dist/docs/01-app/02-guides/testing/playwright.md
//
// Specs live in `e2e/*.spec.ts`. `webServer` builds and serves the production
// app (closest to real behaviour) before the suite runs; locally an already
// running server on the same port is reused.
//
// Port defaults to 3000 but can be overridden with PORT=… (handy when 3000 is
// taken, or in CI).
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
