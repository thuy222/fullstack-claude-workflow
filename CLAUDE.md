# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Monorepo layout

This is a monorepo with two independently-deployed apps, each with its **own** `package.json`,
`node_modules`, lockfile, and tooling. There is **no** top-level workspace — do not add one and
do not expect dependency hoisting.

| Path        | Stack | Read before editing |
| ----------- | ----- | ------------------- |
| `client/`   | Next.js 16 + React 19 + MUI + Tailwind v4 (App Router) | **`client/CLAUDE.md`** |
| `server/`   | NestJS 11 monorepo (`apps/` + `libs/`), Prisma 7 + Postgres, Docker | **`server/CLAUDE.md`** |

**Always work inside the relevant app directory** and read that app's `CLAUDE.md` first — the two
stacks have different versions, conventions, and breaking changes. Run npm commands scoped to the
app (`npm --prefix client …` / `npm --prefix server …`) or from within the folder.

## Shared Claude config (`.claude/`)

`.claude/` is shared across both apps:
- **Review agents:**
  - `agents/review-react-code.md` — front-end reviewer (Next/React/MUI).
  - `agents/review-server.md` — back-end code reviewer (NestJS/Prisma).
  - `agents/review-architecture.md` — structure/boundaries reviewer across the monorepo.
  - `agents/review-db-design.md` — Prisma schema & migration reviewer.
- **`skills/`** — `react-component` (scaffolds into `client/components/`), `generate-spec`
  (writes feature specs into the repo-root `specs/`), `database-design` (designs/evolves the
  server's Prisma schema + migration), `write-test` (generates unit + e2e tests from a spec, for
  the client or server), `html-to-react` (converts an HTML file into reusable React, reusing
  existing components + theme tokens and binding inputs with React Hook Form).
- **`settings.json`** — a `PostToolUse` hook runs Prettier on edited files; it resolves the nearest
  config (`client/.prettierrc` or `server/.prettierrc`), so per-app formatting just works.

Feature specifications live in **`specs/`** at the repo root; their structure is defined by
`specs/template.md` (scaffold or update one with the `generate-spec` skill).

## Root commands

```bash
npm run dev          # client + server together
npm run dev:client   # Next.js → http://localhost:3000
npm run dev:server   # NestJS  → http://localhost:3001
npm run build        # build both
npm run db:up        # start Postgres (docker compose)

npm run test         # unit tests for both apps (client Vitest + server Jest)
npm run test:client  # client unit/component (Vitest)
npm run test:server  # server unit (Jest; mocked Prisma, no DB)
npm run test:e2e:client   # client e2e (Playwright; builds + serves the app)
npm run test:e2e:server   # server e2e (Supertest; needs the test DB — see below)
```

**Testing stacks** (details in each app's `CLAUDE.md`): client uses **Vitest + RTL** (unit/component)
and **Playwright** (e2e); server uses **Jest + Supertest** — unit tests mock `PrismaService`, e2e runs
against a dedicated ephemeral test Postgres (`npm --prefix server run db:test:up` first). Write tests
from a spec with the **`write-test`** skill.
