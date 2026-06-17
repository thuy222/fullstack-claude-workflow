# Agent rules (monorepo)

This repo has two independently-deployed apps. Work inside the relevant folder and read its
`CLAUDE.md` first — the stacks differ in version and conventions.

- `client/` — Next.js 16 front end. See `client/CLAUDE.md`.
- `server/` — NestJS 11 + Prisma 7 + Postgres back end. See `server/CLAUDE.md`.

<!-- BEGIN:nextjs-agent-rules -->
## client/: This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your
training data. Read the relevant guide in `client/node_modules/next/dist/docs/` before writing any
code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## server/: Prisma 7 + NestJS monorepo

Prisma 7 has breaking changes (no `url` in schema, driver adapters, `prisma-client` generator
emitting TypeScript). NestJS runs in monorepo mode (`apps/` + `libs/`, `@app/*` aliases). Read
`server/CLAUDE.md` before changing server code.
