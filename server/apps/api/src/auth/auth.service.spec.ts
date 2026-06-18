import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@app/prisma';
import {
  createPrismaMock,
  type PrismaMock,
} from '@app/prisma/testing/prisma.mock';
import { AuthService } from './auth.service';

// Unit tests for the auth domain logic — Prisma is the deep mock (no DB) and
// JwtService is stubbed to a fixed token. Real bcrypt is used so the
// "hash ≠ plaintext" guarantee (FR-reg.6) is genuinely exercised.
// Traces: specs/authentication.md §9 Acceptance Criteria.
describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaMock;
  const jwt = { sign: jest.fn().mockReturnValue('signed.jwt.token') };

  // A row as Prisma would return it (includes the hash; the service must strip it).
  function userRow(overrides: Partial<Record<string, unknown>> = {}) {
    return {
      id: 'user-1',
      email: 'ada@example.com',
      name: 'Ada',
      passwordHash: 'replace-me',
      createdAt: new Date('2026-06-18T10:00:00.000Z'),
      updatedAt: new Date('2026-06-18T10:00:00.000Z'),
      ...overrides,
    };
  }

  beforeEach(async () => {
    prisma = createPrismaMock();
    jwt.sign.mockClear();
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  describe('register', () => {
    // AC-1, FR-reg.5: hashes the password, persists the user, returns token + user.
    it('hashes the password, persists the user, and returns a token + user', async () => {
      prisma.user.findUnique.mockResolvedValue(null as never);
      prisma.user.create.mockImplementation(((args: {
        data: Record<string, unknown>;
      }) => userRow({ ...args.data })) as never);

      const result = await service.register({
        email: 'ada@example.com',
        password: 'correct horse battery',
        name: 'Ada',
      });

      expect(prisma.user.create).toHaveBeenCalledTimes(1);
      const stored = prisma.user.create.mock.calls[0][0].data.passwordHash;
      expect(stored).not.toBe('correct horse battery'); // never plaintext
      expect(await bcrypt.compare('correct horse battery', stored)).toBe(true);
      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.user).toMatchObject({
        email: 'ada@example.com',
        name: 'Ada',
      });
    });

    // AC-7, FR-reg.6: the safe user never exposes the password hash.
    it('returns a user object that does not include passwordHash', async () => {
      prisma.user.findUnique.mockResolvedValue(null as never);
      prisma.user.create.mockImplementation(((args: {
        data: Record<string, unknown>;
      }) => userRow({ ...args.data })) as never);

      const { user } = await service.register({
        email: 'ada@example.com',
        password: 'correct horse battery',
      });

      expect(user).not.toHaveProperty('passwordHash');
      expect(JSON.stringify(user)).not.toContain('correct horse battery');
    });

    // AC-2, FR-reg.4: duplicate email → ConflictException, no second create.
    it('rejects a duplicate email with ConflictException and does not create', async () => {
      prisma.user.findUnique.mockResolvedValue(userRow() as never);

      await expect(
        service.register({
          email: 'ada@example.com',
          password: 'correct horse battery',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const password = 'correct horse battery';

    // AC-4: valid credentials → token + safe user.
    it('returns a token and safe user for valid credentials', async () => {
      const passwordHash = await bcrypt.hash(password, 10);
      prisma.user.findUnique.mockResolvedValue(
        userRow({ passwordHash }) as never,
      );

      const result = await service.login({
        email: 'ada@example.com',
        password,
      });

      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.user).toMatchObject({ email: 'ada@example.com' });
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    // AC-5: unknown email → UnauthorizedException (generic message, no enumeration).
    it('rejects an unknown email with UnauthorizedException', async () => {
      prisma.user.findUnique.mockResolvedValue(null as never);

      await expect(
        service.login({ email: 'nobody@example.com', password }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    // AC-5: wrong password → identical UnauthorizedException message as unknown email.
    it('rejects a wrong password with the same message as an unknown email', async () => {
      const passwordHash = await bcrypt.hash(password, 10);
      prisma.user.findUnique
        .mockResolvedValueOnce(null as never) // unknown email
        .mockResolvedValueOnce(userRow({ passwordHash }) as never); // wrong password

      const unknownErr = await service
        .login({ email: 'nobody@example.com', password })
        .catch((e: Error) => e);
      const wrongPwErr = await service
        .login({ email: 'ada@example.com', password: 'WRONG' })
        .catch((e: Error) => e);

      expect(unknownErr).toBeInstanceOf(UnauthorizedException);
      expect(wrongPwErr).toBeInstanceOf(UnauthorizedException);
      expect(wrongPwErr.message).toBe(unknownErr.message);
    });
  });
});
