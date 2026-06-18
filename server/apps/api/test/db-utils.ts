import type { PrismaService } from '@app/prisma';

/**
 * Empties every application table in the test database so each e2e test starts
 * from a clean slate. Call it in `beforeEach`. The Prisma migrations bookkeeping
 * table is left intact. Table names come from `pg_tables` (not user input), so
 * the dynamic TRUNCATE is safe.
 */
export async function truncateAll(prisma: PrismaService): Promise<void> {
  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename != '_prisma_migrations'
  `;

  if (tables.length === 0) return;

  const list = tables.map((t) => `"public"."${t.tablename}"`).join(', ');
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`,
  );
}
