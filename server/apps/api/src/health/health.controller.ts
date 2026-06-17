import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '@app/prisma';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Liveness + DB readiness probe. Runs a trivial query to confirm Postgres
   * is reachable. Returns 200 with status details for load balancers / Docker.
   */
  @Get()
  async check(): Promise<{ status: string; db: string }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', db: 'up' };
    } catch {
      return { status: 'degraded', db: 'down' };
    }
  }
}
