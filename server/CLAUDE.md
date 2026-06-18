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

## Testing

**Jest + Supertest** (NestJS default). Generate tests from a spec with the **`write-test`** skill.

- **Unit** (`*.spec.ts`, next to the source): build modules with `Test.createTestingModule` and
  **mock the DB** — never hit Postgres. Use the deep Prisma mock:
  `import { createPrismaMock } from '@app/prisma/testing/prisma.mock'` and provide it as
  `{ provide: PrismaService, useValue: mock }`. Run with `npm run test` (no DB required).
- **E2e** (`apps/api/test/*.e2e-spec.ts`): boot `AppModule` and drive HTTP with Supertest against a
  **dedicated ephemeral test Postgres** (`db-test` in `docker-compose.yml`, port 5434, tmpfs). Connection
  string in `.env.test` (copy from `.env.test.example`). Reset state with `truncateAll(prisma)`
  (`apps/api/test/db-utils.ts`) in `beforeEach`. Migrations are applied automatically by the Jest
  `globalSetup` (`apps/api/test/setup-e2e.ts`). Run: `npm run db:test:up` **then** `npm run test:e2e`.
- The e2e jest config (`apps/api/test/jest-e2e.json`) maps `@app/*` and strips `.js` from the generated
  Prisma client's imports; `test:e2e` sets `NODE_OPTIONS=--experimental-vm-modules` so Prisma 7's client
  can load its WASM query compiler under Jest. The schema's generator uses `moduleFormat = "cjs"` so the
  generated client loads in both Jest and the webpack build — don't switch it back to ESM.

## Database / Docker

- `docker compose up -d db` starts Postgres on `:5432` (creds in `docker-compose.yml`, db `app`).
- `docker compose up --build` runs Postgres + the `api` service together. The api image applies
  migrations on start via `docker-entrypoint.sh` (`prisma migrate deploy`).
- `DATABASE_URL` lives in `.env` (local: host `localhost`; in Docker: host `db`). Commit only
  `.env.example`.
- `GET /health` pings the DB — use it as a readiness probe.

Deploys independently of `client/`.
