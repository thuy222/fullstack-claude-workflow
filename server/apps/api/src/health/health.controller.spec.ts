import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@app/prisma';
import {
  createPrismaMock,
  type PrismaMock,
} from '@app/prisma/testing/prisma.mock';
import { HealthController } from './health.controller';

// Unit test demonstrating the mocked-PrismaService pattern the `write-test`
// skill generates for the server: the real DB is never touched — `$queryRaw`
// is stubbed per case.
describe('HealthController', () => {
  let controller: HealthController;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: PrismaService, useValue: prisma }],
    }).compile();

    controller = moduleRef.get(HealthController);
  });

  it('reports ok + db up when the probe query succeeds', async () => {
    prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    await expect(controller.check()).resolves.toEqual({
      status: 'ok',
      db: 'up',
    });
  });

  it('reports degraded + db down when the probe query throws', async () => {
    prisma.$queryRaw.mockRejectedValue(new Error('connection refused'));

    await expect(controller.check()).resolves.toEqual({
      status: 'degraded',
      db: 'down',
    });
  });
});
