# next-claude monorepo

A monorepo with two independently-deployed apps and a shared Claude Code setup.

```
.
├── client/   # Next.js 16 + React 19 + MUI + Tailwind v4 (App Router)
├── server/   # NestJS 11 monorepo (apps/ + libs/), Prisma 7 + Postgres, Docker
├── .claude/  # shared Claude Code config (agents, skills, hooks)
├── CLAUDE.md / AGENTS.md   # repo-wide agent guidance → see per-app CLAUDE.md
```

Each app keeps its **own `node_modules`, lockfile, and build/deploy pipeline** — there is
no workspace hoisting, so the two sides install, build, and ship independently.

## Prerequisites

- Node.js 22+
- Docker (for Postgres / the server image)

## Install

```bash
npm run install:all      # installs root tooling + client + server
# or per app:
npm --prefix client install
npm --prefix server install
```

## Develop

```bash
npm run dev              # client + server together (via concurrently)
npm run dev:client       # Next.js   → http://localhost:3000
npm run dev:server       # NestJS    → http://localhost:3001  (needs Postgres, see below)
```

Start Postgres for the server:

```bash
npm run db:up            # docker compose up -d db  (Postgres on :5432)
npm --prefix server exec prisma migrate dev    # apply migrations
```

## Build

```bash
npm run build            # builds both
npm run build:client
npm run build:server     # → server/dist/apps/api/main.js
```

## Deploy (separate pipelines)

- **client/** — `output: 'standalone'`; build a container from `client/Dockerfile`, or deploy
  to Vercel. Self-contained.
- **server/** — `docker compose -f server/docker-compose.yml up --build` runs Postgres + the
  `api` service. The image runs `prisma migrate deploy` on start (see `server/docker-entrypoint.sh`).

See `client/CLAUDE.md` and `server/CLAUDE.md` for stack-specific details.
