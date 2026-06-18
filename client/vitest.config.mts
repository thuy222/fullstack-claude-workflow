import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// Vitest + React Testing Library setup for unit/component tests.
// Follows the bundled Next.js 16 guide:
// node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md
//
// Component/unit tests use the `*.test.ts(x)` suffix and live colocated with
// the code. Playwright e2e specs use `*.spec.ts` under `e2e/` and are excluded
// here so the two runners never pick up each other's files.
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", "e2e/**"],
  },
});
