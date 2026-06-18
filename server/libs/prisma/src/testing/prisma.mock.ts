import { mockDeep, type DeepMockProxy } from 'jest-mock-extended';
import { PrismaService } from '../prisma.service';

/**
 * A deeply-mocked PrismaService for **unit tests** — every model method and
 * client method (`user.findMany`, `$queryRaw`, `$transaction`, …) is a Jest
 * mock you can stub with `.mockResolvedValue(...)`. No database is touched.
 *
 * Kept out of the `@app/prisma` barrel on purpose so `jest-mock-extended`
 * (a devDependency) never leaks into the runtime build. Import it directly:
 *
 * ```ts
 * import { createPrismaMock, type PrismaMock } from '@app/prisma/testing/prisma.mock';
 *
 * const prisma = createPrismaMock();
 * const moduleRef = await Test.createTestingModule({
 *   providers: [MyService, { provide: PrismaService, useValue: prisma }],
 * }).compile();
 * prisma.user.findUnique.mockResolvedValue({ id: '…', email: '…' } as never);
 * ```
 */
export type PrismaMock = DeepMockProxy<PrismaService>;

export function createPrismaMock(): PrismaMock {
  return mockDeep<PrismaService>();
}
