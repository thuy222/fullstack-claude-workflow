import { Module } from '@nestjs/common';

/**
 * Shared code reused across server apps (DTOs, guards, interceptors, utils).
 * Import it from any app via `@app/common`.
 */
@Module({})
export class CommonModule {}
