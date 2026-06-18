# Feature Spec: Authentication (Registration & Login)

|             |                                                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Status**  | Draft                                                                                                                                |
| **Owner**   | thuy.hn                                                                                                                              |
| **Updated** | 2026-06-18                                                                                                                           |
| **Scope**   | Email + password self-service registration, login, session via JWT, and logout.                                                      |
| **Stack**   | both — server (NestJS) issues/validates credentials & tokens; client (Next.js) provides the register/login UI and holds the session. |

---

## 1. Context & Goals

The app currently has a `User` model but no way for a person to create an account or prove who they
are. This feature adds email + password registration and login so users have an identity the rest of
the product can build on (ownership, personalization, protected routes). It is the foundation every
later authenticated feature depends on.

**Goals**

- Self-service registration with email + password.
- Login that returns a session credential (JWT) the client can use on subsequent requests.
- A `GET /auth/me` endpoint so the client can resolve the current user from a token.
- Logout that ends the client session.
- Passwords stored only as a strong one-way hash.

**Non-goals (out of scope for this iteration)**

- Email verification / confirmed-ownership flow — Phase 2.
- Password reset / "forgot password" — Phase 2.
- Social / OAuth / SSO login — Phase 2.
- Refresh-token rotation, multi-device session management, MFA — later.
- Role-based authorization (every authenticated user is equal for now).

---

## 2. User Stories

- **US-1** — As a new visitor, I want to register with my email and a password so that I have an account.
- **US-2** — As a returning user, I want to log in with my email and password so that I can access my account.
- **US-3** — As a logged-in user, I want my session to persist across page reloads so that I don't re-enter credentials constantly.
- **US-4** — As a logged-in user, I want to log out so that my session is ended on this device.
- **US-5** — As a user filling the forms, I want clear inline validation and error messages so that I can fix mistakes quickly.

---

## 3. Functional Requirements

### 3.1 Registration (server)

- **FR-reg.1** — `POST /auth/register` accepts `{ email, password, name? }`.
- **FR-reg.2** — `email` is validated as a well-formed email and stored lowercased/trimmed.
- **FR-reg.3** — `password` must be 8–72 characters (72 = bcrypt byte limit); reject otherwise with `400`.
- **FR-reg.4** — If the email already exists, respond `409 EMAIL_TAKEN` (uniform error shape).
- **FR-reg.5** — On success, hash the password, persist the user, and respond `201` with the safe user object **and** an access token (auto-login after registration).
- **FR-reg.6** — The password hash and any plaintext password are never returned in any response.

### 3.2 Login (server)

- **FR-login.1** — `POST /auth/login` accepts `{ email, password }`.
- **FR-login.2** — On valid credentials, respond `200` with `{ accessToken, user }`.
- **FR-login.3** — On unknown email **or** wrong password, respond `401 INVALID_CREDENTIALS` with an identical message for both (no account enumeration).
- **FR-login.4** — The issued JWT encodes `sub` (user id) and `email`, signed with a server secret, expiring per config (default 7 days).

### 3.3 Current user & logout

- **FR-me.1** — `GET /auth/me` requires a valid `Authorization: Bearer <token>` and returns the safe user object; `401` if the token is missing/invalid/expired.
- **FR-logout.1** — Logout is client-side: the client discards the stored token. (No server token blocklist this iteration — documented in Open Questions.)

### 3.4 Client UI

- **FR-ui.1** — A `/register` page with email, password, and optional name fields plus a submit button.
- **FR-ui.2** — A `/login` page with email and password fields plus a submit button.
- **FR-ui.3** — Both forms show inline field validation (required, email format, password length) before submit and a top-level error on a failed API call.
- **FR-ui.4** — On success, store the token, populate auth state, and redirect to the app's authenticated landing page.
- **FR-ui.5** — Submit buttons show a loading state and are disabled while a request is in flight.
- **FR-ui.6** — A logout control clears the token/auth state and redirects to `/login`.

---

## 4. API Contract

All bodies are JSON. The "safe user" object is `{ id, email, name, createdAt }` — never includes the password hash.

| Method | Path             | Auth   | Body / Notes                                               |
| ------ | ---------------- | ------ | ---------------------------------------------------------- |
| POST   | `/auth/register` | —      | `{ email, password, name? }` → `201 { accessToken, user }` |
| POST   | `/auth/login`    | —      | `{ email, password }` → `200 { accessToken, user }`        |
| GET    | `/auth/me`       | Bearer | → `200 { user }`                                           |

**Example — `POST /auth/register`**

```json
// Request
{ "email": "ada@example.com", "password": "correct horse battery", "name": "Ada" }

// 201 Created
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "uuid", "email": "ada@example.com", "name": "Ada", "createdAt": "2026-06-18T10:00:00.000Z" }
}
```

**Example — `POST /auth/login`**

```json
// Request
{ "email": "ada@example.com", "password": "correct horse battery" }

// 200 OK
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "uuid", "email": "ada@example.com", "name": "Ada", "createdAt": "2026-06-18T10:00:00.000Z" }
}
```

**Error shape (uniform)**

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email or password is incorrect."
  }
}
```

Error codes used: `VALIDATION_ERROR` (400), `INVALID_CREDENTIALS` (401), `UNAUTHORIZED` (401, missing/bad token), `EMAIL_TAKEN` (409), `RATE_LIMITED` (429).

---

## 5. Data Model

Extends the existing `User` model in `server/prisma/schema.prisma` with a password hash. Implement with the `database-design` skill.

```
User  (existing — add one field)
  id           String    @id @default(uuid())
  email        String    @unique           lowercased on write
  name         String?
  passwordHash String                       bcrypt/argon2 hash; never exposed via API
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
```

- `passwordHash` is required for new users; existing rows (if any) need a migration default or backfill — see Open Questions.
- The unique constraint on `email` enforces FR-reg.4 at the DB level (handle the unique-violation as `409`).

---

## 6. Non-Functional Requirements

- **NFR-1** — `POST /auth/login` and `POST /auth/register` are rate-limited (default 10 req/min/IP); breach returns `429 RATE_LIMITED`. (NestJS `@nestjs/throttler`.)
- **NFR-2** — Password hashing uses a deliberately slow KDF (bcrypt cost ≥ 12, or argon2id) so a login takes O(100ms), not microseconds.
- **NFR-3** — Login responds within ~500ms p95 under normal load (excluding deliberate hash cost).
- **NFR-4** — Forms are accessible: labelled inputs, errors associated via `aria-describedby`, submit reachable and operable by keyboard.
- **NFR-5** — No password, hash, or token value is ever written to logs.

---

## 7. Security Considerations

- Passwords hashed with bcrypt (cost ≥ 12) or argon2id; plaintext never logged or persisted.
- Login returns an identical error for unknown-email and wrong-password to prevent **account enumeration** (FR-login.3). Registration's `409` is an accepted, documented enumeration trade-off for UX — revisit if it becomes a concern.
- JWT signed with a strong secret from server config/env (never committed); reject `alg: none` and unsigned tokens.
- Validate and normalize all input server-side with `class-validator` DTOs (`whitelist: true`) — never trust the client.
- Transport over HTTPS in deployed environments.
- **Token storage on the client:** decide between `httpOnly` cookie (CSRF protection needed) vs. in-memory/`localStorage` (XSS exposure) — see Open Questions. Default assumption for this iteration: `localStorage` for simplicity, accepting the XSS trade-off.
- Generic, non-leaky error messages; stack traces never returned to the client.

---

## 8. Edge Cases

- Duplicate registration (same email, possibly racing two requests) → exactly one succeeds, the other gets `409 EMAIL_TAKEN` (DB unique constraint is the source of truth).
- Email with different casing/whitespace (`Ada@Example.com `) → normalized so it can't create a second account.
- Password at the boundary (7 vs 8 chars; 72 vs 73 chars) → rejected/accepted exactly per FR-reg.3.
- Expired or tampered JWT on `GET /auth/me` → `401 UNAUTHORIZED`, no partial data.
- Malformed JSON / missing fields → `400 VALIDATION_ERROR`, no 500.
- Client submits while offline / server unreachable → form shows a top-level network error, button re-enabled.
- Already-logged-in user navigates to `/login` or `/register` → redirected to the authenticated landing page.
- Rapid repeated login attempts → throttled with `429` (NFR-1).

---

## 9. Acceptance Criteria

- [ ] Given a new email and a valid password, when I `POST /auth/register`, then I get `201` with `{ accessToken, user }` and the user is persisted with a hashed (not plaintext) password. _(US-1, FR-reg.1, FR-reg.5, FR-reg.6)_
- [ ] Given an email that already exists, when I register, then I get `409 EMAIL_TAKEN` and no second user is created. _(FR-reg.4, Edge: duplicate)_
- [ ] Given a password shorter than 8 or longer than 72 chars, when I register, then I get `400 VALIDATION_ERROR`. _(FR-reg.3)_
- [ ] Given valid credentials, when I `POST /auth/login`, then I get `200` with `{ accessToken, user }`. _(US-2, FR-login.1, FR-login.2)_
- [ ] Given a wrong password OR an unknown email, when I log in, then I get `401 INVALID_CREDENTIALS` with the same message for both cases. _(US-2, FR-login.3, Security: enumeration)_
- [ ] Given a valid access token, when I `GET /auth/me`, then I get `200` with the safe user object; given no/invalid/expired token I get `401`. _(US-3, FR-me.1)_
- [ ] Given any auth response, then no response body ever contains `passwordHash` or the plaintext password. _(FR-reg.6, Security)_
- [ ] Given the `/register` and `/login` pages, when I submit invalid input, then inline field errors appear and the request is not sent. _(US-5, FR-ui.3)_
- [ ] Given a successful login/registration in the UI, when the request resolves, then the token is stored, auth state is set, and I'm redirected to the authenticated landing page. _(US-1, US-2, FR-ui.4)_
- [ ] Given I am logged in, when I click logout, then the token/auth state is cleared and I'm redirected to `/login`. _(US-4, FR-logout.1, FR-ui.6)_
- [ ] Given more than 10 login attempts in a minute from one IP, when I try again, then I get `429 RATE_LIMITED`. _(NFR-1)_

---

## 10. Open Questions

- **Token storage on the client** — `httpOnly` cookie (needs CSRF defense, works with SSR) vs. `localStorage` (simpler, XSS-exposed)? Default assumed: `localStorage`. _(owner: thuy.hn)_
- **Logout semantics** — client-side discard only, or add a server-side token blocklist / short-lived access + refresh tokens? Current iteration: client-side only. _(owner: thuy.hn)_
- **Existing `User` rows** — does any data exist that needs a `passwordHash` backfill, or can the migration assume an empty table? _(owner: thuy.hn)_
- **Authenticated landing route** — what is the post-login redirect target (`/`, `/dashboard`, …)? _(owner: thuy.hn)_
- **JWT expiry & refresh** — confirm 7-day access-token lifetime with no refresh is acceptable for this phase. _(owner: thuy.hn)_
