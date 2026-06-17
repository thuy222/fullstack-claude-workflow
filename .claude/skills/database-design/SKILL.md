---
name: database-design
description: Design or evolve the server's Prisma data model (PostgreSQL) following project conventions, then regenerate the client and create a migration. Use when adding or changing models, tables, relations, indexes, or enums in server/prisma/schema.prisma.
---

# database-design

Design or evolve the **server's** data model — Prisma 7 schema on PostgreSQL — to a high standard,
then generate the client and create a migration. This is the proactive counterpart to the read-only
`review-db-design` agent; run that agent afterward to check the result.

## Before you start

1. Work inside `server/`. Read **`server/CLAUDE.md`** and the current **`server/prisma/schema.prisma`**
   so new models match what's already there.
2. This project uses **Prisma 7** — the `prisma-client` generator emits a TypeScript client to
   `server/generated/prisma`, there is **no `url` in the datasource** (a driver adapter supplies it),
   and `prisma.config.ts` holds the CLI connection string. Do not rely on memory of older Prisma.

## Steps

1. **Clarify the model.** Identify the entities, their fields, the relationships (and cardinality),
   and — critically — the **query/access patterns** the app will run. Indexes follow the queries, so
   ask briefly if these are unclear.
2. **Edit `server/prisma/schema.prisma`** following the **Conventions** below. If the schema is
   growing unwieldy, mention the option to split it into a `prisma/schema/` folder (the
   `prismaSchemaFolder` feature) organized by domain.
3. **Regenerate:** `npx prisma generate` (rebuilds the TS client in `generated/prisma`).
4. **Migrate:** ensure Postgres is running (`npm run db:up` from the repo root, or
   `docker compose -f server/docker-compose.yml up -d db`), then
   `npx prisma migrate dev --name <concise_change>`. **Open and review the generated SQL** under
   `server/prisma/migrations/` before considering it done.
5. **Report** the models added/changed, the migration name, and any follow-ups. Suggest running the
   `review-db-design` agent.

## Conventions (the project standard)

- **Names & mapping.** Models are **singular PascalCase**; fields are **camelCase**. Map every model
  and column to **snake_case** in the database so Postgres stays idiomatic while the Prisma Client API
  stays camelCase: `@@map("plural_snake_table")` on the model, `@map("snake_column")` on fields.
- **Primary key.** UUID by default: `id String @id @default(uuid()) @db.Uuid`.
- **Relations.** Declare the relation field **and** an explicit scalar foreign key (snake_case via
  `@map`). Set referential actions intentionally — `onDelete: Cascade | Restrict | SetNull`,
  `onUpdate` likewise — never leave them implicit for important relations.
- **Indexes.** Add `@@index` on **every foreign key** and on columns used in `where` / `orderBy` /
  joins. Use `@unique` / `@@unique` for natural keys. For composite indexes, order columns to match
  the query (equality columns first, then range/sort). Don't over-index — each one taxes writes.
- **Data types.** Use native `@db.*` types: `@db.VarChar(n)` for bounded strings, `@db.Text` for long
  text, `Decimal @db.Decimal(p,s)` for money (**never `Float`**), `DateTime @db.Timestamptz(6)` for
  timestamps, `BigInt` for large ranges. Use an `enum` for fixed sets instead of free-text.
- **Timestamps & soft delete.** Standard on core models:
  `createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz(6)` and
  `updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamptz(6)`. Add
  `deletedAt DateTime? @map("deleted_at") @db.Timestamptz(6)` only when soft delete is actually needed.
- **Nullability & defaults** are deliberate decisions — make non-null the default and justify nullable
  columns. Enums are PascalCase and kept together.

### Example model (demonstrates every convention)

```prisma
enum PostStatus {
  Draft
  Published
  Archived
}

model Post {
  id          String     @id @default(uuid()) @db.Uuid
  title       String     @db.VarChar(200)
  body        String     @db.Text
  status      PostStatus @default(Draft)
  authorId    String     @map("author_id") @db.Uuid
  author      User       @relation(fields: [authorId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  publishedAt DateTime?  @map("published_at") @db.Timestamptz(6)
  createdAt   DateTime   @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt   DateTime   @updatedAt @map("updated_at") @db.Timestamptz(6)

  @@index([authorId])
  @@index([status, publishedAt])
  @@map("posts")
}
```

> Note: the existing `User` model uses Prisma defaults (no `@@map`/`@map`). When you touch it, flag it
> for optional alignment to this standard — but don't rewrite it unless the user asks (renaming a live
> table/column is a migration with data implications; see below).

## Migration safety

- **`migrate dev`** locally (creates + applies + regenerates); **`migrate deploy`** in prod/CI (applies
  committed migrations only). **`migrate reset`** is **dev-only** — it drops the database.
- **Never edit a migration that has already been applied/committed** — add a new one.
- **Changing or removing a column on a populated or live database → use expand-contract**, never a
  rename/drop in a single step under rolling deploys:
  1. **Expand:** add the new column nullable (with a safe default); deploy.
  2. **Dual-write/backfill:** app writes both old and new; backfill historical rows in **batches**.
  3. **Switch reads** to the new column; deploy.
  4. **Contract:** once nothing reads the old column, drop it in a later migration.

## Prisma 7 reminders

- Always run `npx prisma generate` after editing the schema (the client is generated TypeScript).
- No `url` in `datasource` — the runtime connects via the `@prisma/adapter-pg` driver adapter; the CLI
  reads the connection string from `prisma.config.ts` (loaded from `.env`).
- Inject data access through `PrismaService` from `@app/prisma` (`libs/prisma`), not a fresh client.

## Querying notes (for the code that uses the model)

- Scope `select` / `include` to what's needed — avoid over-fetching and N+1 (load relations in one
  query rather than per-row).
- Wrap multi-step writes that must be atomic in `prisma.$transaction([...])`.
- Never build SQL by string interpolation with `$queryRawUnsafe` — use `$queryRaw` tagged templates or
  the typed Client (SQL injection risk).
