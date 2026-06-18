# CLAUDE.md — client/ (Next.js front end)

Guidance for the front-end app. See the repo-root `CLAUDE.md` for the monorepo overview.

## Critical: read the bundled docs before writing Next.js code

This app runs **Next.js 16.2.9** with **React 19.2.4** — newer than training data, with breaking
changes to APIs, conventions, and file structure. Before writing or changing any Next.js code, read
the relevant guide under `node_modules/next/dist/docs/` (organized as `01-app/`, `02-pages/`,
`03-architecture/`; start at `index.md`). The docs contain version-specific AI agent hints and
deprecation notices — e.g. fixing slow client-side navigation requires exporting `unstable_instant`
from the route, not just adding Suspense; `middleware.ts` is now `proxy.ts`; request APIs
(`cookies()`, `headers()`, `params`) are async. Do not rely on memory of older Next.js versions.

## Commands (run from `client/`, or `npm --prefix client run <script>`)

```bash
npm run dev     # start dev server at http://localhost:3000
npm run build   # production build (emits standalone output)
npm run start   # serve the production build
npm run lint    # run ESLint
```

## Testing

- **Unit / component:** **Vitest + React Testing Library + jsdom**. Test files are `*.test.tsx`,
  colocated next to the code. Import render helpers from **`@/test/test-utils`** (wraps the MUI theme
  provider), not `@testing-library/react` directly. Config: `vitest.config.mts` + `vitest.setup.ts`.
- **E2e:** **Playwright**. Specs live in `e2e/*.spec.ts`; config `playwright.config.ts` builds and
  serves the production app on `:3000`. First run needs `npm exec playwright install` (downloads
  browsers).
- **Async Server Components:** cover with **e2e**, not Vitest — Vitest can't render them (see the
  bundled guide `node_modules/next/dist/docs/01-app/02-guides/testing/{vitest,playwright}.md`).
- **Commands:** `npm run test` (unit, single run) · `npm run test:watch` · `npm run test:e2e`.
- Generate tests from a spec with the **`write-test`** skill.

## Architecture

- **App Router** project (`app/` directory). `app/layout.tsx` is the root layout (loads Geist fonts
  via `next/font/google`, sets `<html>`/`<body>`); `app/page.tsx` is the home route.
- **Styling is Tailwind CSS v4** — configured entirely in `app/globals.css` via `@import "tailwindcss"`
  and an `@theme inline` block. There is no `tailwind.config.*` file; theme tokens (colors, fonts)
  are declared in CSS. PostCSS uses `@tailwindcss/postcss` (`postcss.config.mjs`).
- **MUI** is used for components (`@mui/material`, theming via `theme.ts` + `components/ThemeRegistry.tsx`).
- **Reusable components** live in `client/components/` (built on MUI; see the `react-component` skill).
  Don't hard-code colors — use theme tokens (`sx` / Tailwind `@theme`), adding a token to `theme.ts`
  when one is missing. **Forms bind inputs with React Hook Form** behind reusable field wrappers
  (`InputControl`, `SelectControl`). Turn an HTML file/mockup into React with the **`html-to-react`**
  skill (reuses existing components, binds via RHF, can satisfy `write-test`-generated tests).
- **TypeScript** is strict; the `@/*` path alias maps to the **client root** (`tsconfig.json`).
- **ESLint** uses the flat-config format (`eslint.config.mjs`) composing
  `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.
- **Deployment:** `next.config.ts` sets `output: 'standalone'` and `outputFileTracingRoot` to the
  repo root (this app lives in a monorepo subfolder). A `Dockerfile` is provided; the app can also
  deploy to Vercel. It deploys independently of `server/`.
