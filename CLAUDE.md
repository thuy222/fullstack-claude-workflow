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
- **`agents/review-code.md`** — front-end reviewer (Next/React/MUI).
- **`agents/review-server.md`** — back-end reviewer (NestJS/Prisma).
- **`skills/`** — `create-component` (writes to `client/components/`), `create-spec`.
- **`settings.json`** — a `PostToolUse` hook runs Prettier on edited files; it resolves the nearest
  config (`client/.prettierrc` or `server/.prettierrc`), so per-app formatting just works.

## Root commands

```bash
npm run dev          # client + server together
npm run dev:client   # Next.js → http://localhost:3000
npm run dev:server   # NestJS  → http://localhost:3001
npm run build        # build both
npm run db:up        # start Postgres (docker compose)
```

There is no repo-wide test setup yet.
