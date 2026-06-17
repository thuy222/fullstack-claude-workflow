import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
// Prisma 7 emits a TypeScript client to ./generated/prisma (see schema.prisma).
import { PrismaClient } from '../../../generated/prisma/client';

/**
 * Wraps the generated Prisma client as an injectable, lifecycle-aware service.
 * Prisma 7 connects through a driver adapter (`@prisma/adapter-pg`) rather than
 * a URL in the schema — the connection string comes from DATABASE_URL at runtime.
 *
 * Inject it anywhere: `constructor(private prisma: PrismaService) {}`.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set');
    }
    super({ adapter: new PrismaPg({ connectionString }) });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
