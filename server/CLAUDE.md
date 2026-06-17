# CLAUDE.md — server/ (NestJS back end)

Guidance for the back-end app. See the repo-root `CLAUDE.md` for the monorepo overview.

## Stack

**NestJS 11** in **monorepo mode**, **Prisma 7** (driver-adapter mode) on **PostgreSQL**, Docker.

## Monorepo structure (`nest-cli.json`)

```
apps/
  api/            # the deployable HTTP service (default project)
libs/
  prisma/         # PrismaModule + PrismaService   → import via `@app/prisma`
  common/         # shared DTOs/utils/guards        → import via `@app/common`
prisma/
  schema.prisma   # models + generator + datasource
  migrations/     # SQL migrations (committed)
generated/prisma/ # generated Prisma client (gitignored — run `prisma generate`)
```

- **Add a microservice:** `npx nest generate app <name>` creates `apps/<name>` — no restructuring.
- **Path aliases** `@app/*` are declared in root `tsconfig.json` and `nest-cli.json` projects.
- The build uses **webpack** with a custom `webpack.config.js` that maps `.js` → `.ts` so Prisma 7's
  ESM-style generated client resolves. Do not remove it.

## Prisma 7 — important version notes (differs from older Prisma)

- Generator is **`prisma-client`** (not `prisma-client-js`); it emits **TypeScript** to
  `generated/prisma/`, imported via a relative path in `libs/prisma/src/prisma.service.ts`.
- The datasource **`url` is not allowed in `schema.prisma`**. The connection string lives in
  `prisma.config.ts` (for the CLI, loaded from `.env` via dotenv) and is passed to the runtime
  client through the **`@prisma/adapter-pg` driver adapter** (`new PrismaClient({ adapter })`).
- `.env` is **not** auto-loaded by the Prisma CLI — `prisma.config.ts` imports `dotenv/config`.

## Commands (run from `server/`, or `npm --prefix server run <script>`)

```bash
npm run start:dev          # watch mode → http://localhost:3001
npm run build              # nest build (default project: api) → dist/apps/api/main.js
npm run lint               # eslint --fix
npx prisma generate        # regenerate client after editing schema.prisma
npx prisma migrate dev --name <name>   # create + apply a migration (dev)
npx prisma migrate deploy  # apply migrations (prod / CI)
```

## Database / Docker

- `docker compose up -d db` starts Postgres on `:5432` (creds in `docker-compose.yml`, db `app`).
- `docker compose up --build` runs Postgres + the `api` service together. The api image applies
  migrations on start via `docker-entrypoint.sh` (`prisma migrate deploy`).
- `DATABASE_URL` lives in `.env` (local: host `localhost`; in Docker: host `db`). Commit only
  `.env.example`.
- `GET /health` pings the DB — use it as a readiness probe.

Deploys independently of `client/`.
