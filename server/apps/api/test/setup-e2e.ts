import { execSync } from 'node:child_process';

/**
 * Jest `globalSetup` for e2e tests: applies all committed migrations to the
 * test database once, before any suite runs.
 *
 * `DATABASE_URL` is supplied by `dotenv -e .env.test` in the `test:e2e` npm
 * script and points at the ephemeral test Postgres (docker `db-test`, :5433).
 * `prisma migrate deploy` only applies existing migrations (never generates),
 * so it's safe to run against the throwaway test DB on every run.
 */
export default function globalSetup(): void {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not set — run e2e via `npm run test:e2e` (loads .env.test) ' +
        'and start the test DB with `npm run db:test:up`.',
    );
  }

  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
}
