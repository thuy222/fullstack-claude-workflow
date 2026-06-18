import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from '@app/prisma';
import { AppModule } from './../src/app.module';
import { truncateAll } from './db-utils';

// E2e for the auth feature: boots the real Nest app against the dedicated test
// Postgres, drives HTTP with Supertest, and truncates between tests. Error
// responses are asserted against the uniform `{ error: { code, message } }`
// shape (specs/authentication.md §4).
// Traces: specs/authentication.md §9 Acceptance Criteria.
describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const validUser = {
    email: 'ada@example.com',
    password: 'correct horse battery',
    name: 'Ada',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await truncateAll(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  const server = () => request(app.getHttpServer());

  describe('POST /auth/register', () => {
    // AC-1, AC-7: 201 with token + safe user; DB stores a hash, not plaintext.
    it('registers a new user and returns a token + safe user', async () => {
      const res = await server()
        .post('/auth/register')
        .send(validUser)
        .expect(201);

      expect(res.body.accessToken).toEqual(expect.any(String));
      expect(res.body.user).toMatchObject({
        email: 'ada@example.com',
        name: 'Ada',
      });
      expect(res.body.user.id).toEqual(expect.any(String));
      // AC-7: no secret material leaks in the response.
      expect(res.body.user).not.toHaveProperty('passwordHash');
      expect(JSON.stringify(res.body)).not.toContain(validUser.password);

      // DB row holds a hash, never the plaintext.
      const row = await prisma.user.findUnique({
        where: { email: 'ada@example.com' },
      });
      expect(row).not.toBeNull();
      expect((row as { passwordHash: string }).passwordHash).not.toBe(
        validUser.password,
      );
    });

    // AC-2, FR-reg.4: duplicate email → 409 EMAIL_TAKEN, exactly one row.
    it('rejects a duplicate email with 409 EMAIL_TAKEN', async () => {
      await server().post('/auth/register').send(validUser).expect(201);

      const res = await server()
        .post('/auth/register')
        .send(validUser)
        .expect(409);
      expect(res.body.error.code).toBe('EMAIL_TAKEN');

      const count = await prisma.user.count({
        where: { email: 'ada@example.com' },
      });
      expect(count).toBe(1);
    });

    // AC-3, FR-reg.3: password length boundaries (8..72).
    it('rejects a password shorter than 8 characters with 400 VALIDATION_ERROR', async () => {
      const res = await server()
        .post('/auth/register')
        .send({ ...validUser, password: 'short7!' }) // 7 chars
        .expect(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects a password longer than 72 characters with 400 VALIDATION_ERROR', async () => {
      const res = await server()
        .post('/auth/register')
        .send({ ...validUser, password: 'a'.repeat(73) })
        .expect(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    // FR-reg.2 / Edge: malformed email and missing fields → 400, never 500.
    it('rejects a malformed email with 400 VALIDATION_ERROR', async () => {
      const res = await server()
        .post('/auth/register')
        .send({ ...validUser, email: 'not-an-email' })
        .expect(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects missing fields with 400 VALIDATION_ERROR', async () => {
      const res = await server().post('/auth/register').send({}).expect(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    // Edge (casing/whitespace): emails are normalized so no duplicate slips through.
    it('normalizes email casing/whitespace so a near-duplicate is rejected', async () => {
      await server()
        .post('/auth/register')
        .send({ ...validUser, email: 'Ada@Example.com ' })
        .expect(201);

      const res = await server()
        .post('/auth/register')
        .send({ ...validUser, email: 'ada@example.com' })
        .expect(409);
      expect(res.body.error.code).toBe('EMAIL_TAKEN');

      const count = await prisma.user.count();
      expect(count).toBe(1);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await server().post('/auth/register').send(validUser).expect(201);
    });

    // AC-4: valid credentials → 200 with token + user.
    it('logs in with valid credentials', async () => {
      const res = await server()
        .post('/auth/login')
        .send({ email: validUser.email, password: validUser.password })
        .expect(200);

      expect(res.body.accessToken).toEqual(expect.any(String));
      expect(res.body.user).toMatchObject({ email: 'ada@example.com' });
      expect(res.body.user).not.toHaveProperty('passwordHash');
    });

    // AC-5, FR-login.3: wrong password and unknown email → identical 401.
    it('returns identical 401 INVALID_CREDENTIALS for wrong password and unknown email', async () => {
      const wrongPw = await server()
        .post('/auth/login')
        .send({ email: validUser.email, password: 'WRONG' })
        .expect(401);

      const unknown = await server()
        .post('/auth/login')
        .send({ email: 'nobody@example.com', password: validUser.password })
        .expect(401);

      expect(wrongPw.body.error.code).toBe('INVALID_CREDENTIALS');
      expect(unknown.body.error.code).toBe('INVALID_CREDENTIALS');
      // No account enumeration: the messages must be byte-identical.
      expect(wrongPw.body.error.message).toBe(unknown.body.error.message);
    });
  });

  describe('GET /auth/me', () => {
    // AC-6, FR-me.1: valid Bearer → 200 safe user.
    it('returns the current user for a valid Bearer token', async () => {
      const { body } = await server()
        .post('/auth/register')
        .send(validUser)
        .expect(201);

      const res = await server()
        .get('/auth/me')
        .set('Authorization', `Bearer ${body.accessToken}`)
        .expect(200);

      expect(res.body.user).toMatchObject({ email: 'ada@example.com' });
      expect(res.body.user).not.toHaveProperty('passwordHash');
    });

    // AC-6: missing token → 401.
    it('rejects a request with no token (401)', async () => {
      await server().get('/auth/me').expect(401);
    });

    // AC-6: malformed / bad-signature token → 401. (A valid-but-expired token
    // can't be forged without the server secret; true expiry is left to a
    // service/config-level test.)
    it('rejects a malformed / bad-signature token (401)', async () => {
      await server()
        .get('/auth/me')
        .set('Authorization', 'Bearer not.a.real.token')
        .expect(401);
    });
  });

  // AC-10, NFR-1: rate limiting. Pending until @nestjs/throttler is wired —
  // enable this once the global throttler guard + RATE_LIMITED error are in place.
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('rate-limits login to 10 req/min/IP and returns 429 RATE_LIMITED', async () => {
    await server().post('/auth/register').send(validUser).expect(201);

    let last: request.Response | undefined;
    for (let i = 0; i < 11; i++) {
      last = await server()
        .post('/auth/login')
        .send({ email: validUser.email, password: 'WRONG' });
    }
    expect(last?.status).toBe(429);
    expect(last?.body.error.code).toBe('RATE_LIMITED');
  });
});
