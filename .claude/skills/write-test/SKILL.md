---
name: write-test
description: Generate unit and e2e tests for a feature from its spec, for either the client (Next.js — Vitest + Playwright) or the server (NestJS — Jest + Supertest). Use when starting a feature test-first, or when asked to write/scaffold tests for a spec or an existing module.
argument-hint: <client|server> <specs/feature.md>
---

# write-test

Turn a feature **spec** into runnable **unit** and **e2e** tests for one app. This is the test-first
step: write the spec with `generate-spec`, then run this to produce the tests *before* (or alongside)
the implementation. The test stacks are already set up — this skill writes tests on top of them.

## Inputs

1. **Target** — `client` or `server`. If not given, ask.
2. **Spec file** — a path under `specs/` (e.g. `specs/password-reset.md`). If not given, list `specs/`
   and ask which one. If no spec exists yet, suggest running `generate-spec` first.

## Before you write tests

1. **Read the spec** — focus on **Acceptance Criteria** (the testable "given/when/then" lines) and
   **Edge Cases**. Each becomes one or more tests. Note anything under **Open Questions** that blocks a
   test and raise it rather than guessing.
2. **Read the target app's `CLAUDE.md`** (`client/CLAUDE.md` or `server/CLAUDE.md`) for stack-specific
   conventions.
3. **Client only:** read the bundled, version-accurate testing guides before writing — the front end
   is Next.js 16 and its testing APIs differ from older versions:
   - `client/node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md`
   - `client/node_modules/next/dist/docs/01-app/02-guides/testing/playwright.md`
4. **Confirm the stack is installed.** If the config files below are missing (fresh clone without
   `npm install`, or the stack was never set up), install/scaffold it first — see "If the stack is
   missing".

## Client (Next.js — Vitest + RTL + Playwright)

- **Unit / component tests** — Vitest + React Testing Library. File `*.test.tsx`, **colocated** next to
  the component/hook/util (e.g. `components/ResetForm.test.tsx`). Import the render helpers from
  **`@/test/test-utils`** (not `@testing-library/react`) so the component renders inside the app's MUI
  theme provider. Use `userEvent` for interaction, query by **role/label/text** (not test ids).
  Cover: rendering, prop variants, user interaction, validation/error states, conditional UI.
- **E2e tests** — Playwright. File `client/e2e/<feature>.spec.ts`. Drive real user flows from the
  acceptance criteria against the running app (`page.goto('/…')`, role-based locators, assertions on
  URL/visible content).
- **Async Server Components** must be covered by **e2e**, not Vitest — the bundled vitest guide notes
  Vitest can't render them. Synchronous Server Components and Client Components are fine in Vitest.
- **Run:** `npm --prefix client run test` (unit, single run) · `npm --prefix client run test:watch` ·
  `npm --prefix client run test:e2e` (Playwright; first ever run needs `npm --prefix client exec
  playwright install` to download browsers).

## Server (NestJS — Jest + Supertest)

- **Unit tests** — file `*.spec.ts` **next to the source** (e.g. `apps/api/src/users/users.service.spec.ts`).
  Build the module with `Test.createTestingModule`. **Mock the database** with the deep Prisma mock —
  never hit a real DB in a unit test:

  ```ts
  import { PrismaService } from '@app/prisma';
  import { createPrismaMock, type PrismaMock } from '@app/prisma/testing/prisma.mock';

  let prisma: PrismaMock;
  const moduleRef = await Test.createTestingModule({
    providers: [UsersService, { provide: PrismaService, useValue: prisma = createPrismaMock() }],
  }).compile();

  prisma.user.findUnique.mockResolvedValue({ id: '…', email: 'a@b.com' } as never);
  ```

  Mock external boundaries (Prisma, HTTP clients, queues); assert on returned values, thrown
  exceptions (`BadRequestException`, etc.), and that the right Prisma calls were made.
- **E2e tests** — file `apps/api/test/<feature>.e2e-spec.ts`. Boot the real app
  (`Test.createTestingModule({ imports: [AppModule] })` → `createNestApplication`) and drive HTTP with
  Supertest against the **dedicated test Postgres**. Reset state with `truncateAll(prisma)` (from
  `apps/api/test/db-utils.ts`) in `beforeEach`. Cover endpoints: status codes, response shape,
  validation failures (400/422), auth (401/403), not-found (404), and edge cases from the spec.
  Pattern: `apps/api/test/app.e2e-spec.ts`.
- **Run:** `npm --prefix server run test` (unit; no DB needed) · `npm --prefix server run db:test:up`
  **then** `npm --prefix server run test:e2e` (e2e; needs the test DB up — migrations are applied
  automatically by the Jest globalSetup `apps/api/test/setup-e2e.ts`).

## Conventions for every test

- **Trace to the spec.** Put a short comment linking each test (or `describe` block) to the acceptance
  criterion it covers, so coverage is auditable against the spec.
- **AAA** — arrange, act, assert. One behaviour per test; a descriptive name taken from the criterion
  (`it('rejects an expired reset token', …)`).
- **Deterministic** — no real network, no real wall-clock/random; mock them. Tests must pass in any
  order (server e2e relies on per-test truncation for this).
- **Mock only at boundaries** — don't mock the unit under test; do mock its external dependencies.

## After generating

1. Run the relevant suite(s) and report pass/fail per file.
2. **Test-first is expected to fail.** When the feature isn't implemented yet, the new tests *should*
   fail — clearly separate **"pending implementation"** failures (the feature doesn't exist) from real
   **setup errors** (import/config problems) so the user knows the harness is sound.
3. List the files created and, for each, which acceptance criteria they cover and any criteria left
   untested (with why).
4. Suggest a review: the `review-react-code` agent for client tests, `review-server` for server tests.

## If the stack is missing

The stacks are already configured in this repo; you normally only run the commands above. If a clone
hasn't installed deps, run `npm --prefix client install` / `npm --prefix server install` (and
`playwright install` for browsers). The key pieces, for reference:

- **client:** `vitest.config.mts`, `vitest.setup.ts`, `test/test-utils.tsx`, `playwright.config.ts`;
  dev deps `vitest @vitejs/plugin-react jsdom @testing-library/{react,dom,jest-dom,user-event}
  vite-tsconfig-paths @playwright/test`.
- **server:** Jest is built into NestJS; e2e config `apps/api/test/jest-e2e.json` (maps `@app/*` and
  strips `.js` from the generated Prisma client's imports), the `db-test` compose service + `.env.test`,
  and the `createPrismaMock` helper. The e2e script sets `NODE_OPTIONS=--experimental-vm-modules` so
  Prisma 7's client can load its WASM query compiler under Jest — keep it.
