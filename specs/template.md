<!-- Fill every section with concrete content; delete the <…> hints. Keep the
     stable IDs (US-n, FR-n.m) so requirements, tests, and PRs can cite them.
     Remove a section only if it's truly N/A for this feature (e.g. no Data Model
     for a pure UI change, no API Contract for a static page). Track acceptance
     criteria with - [ ] checkboxes. -->

# Feature Spec: <Feature Name>

| | |
|---|---|
| **Status** | Draft |
| **Owner** | <name> |
| **Updated** | <YYYY-MM-DD> |
| **Scope** | <one line: what this feature covers> |
| **Stack** | <which app(s) — client (Next.js) / server (NestJS) / both> |

---

## 1. Context & Goals

<One short paragraph: the problem this solves, who it's for, and why now.>

**Goals**

- <e.g. Self-service registration with verified email ownership.>

**Non-goals (out of scope for this iteration)**

- <e.g. Social / OAuth login — Phase 2.>

---

## 2. User Stories

- **US-1** — As a <role>, I want <action> so that <value>.

---

## 3. Functional Requirements

<Group by sub-feature; number FR-<group>.<n> so tests and PRs can reference them.>

### 3.1 <Sub-feature>

- **FR-1.1** — <specific, testable behaviour>.

---

## 4. API Contract

<Endpoints this feature adds or changes. Omit the whole section if there's no API
surface. DTOs/validation live on the server (NestJS).>

| Method | Path | Auth | Body / Notes |
|---|---|---|---|
| POST | `/…` | — | `{ … }` → `2xx { … }` |

**Example — `<METHOD> <path>`**

```json
// Request
{ }

// 200 OK
{ }
```

**Error shape (uniform)**

```json
{ "error": { "code": "<CODE>", "message": "<human-readable message>" } }
```

---

## 5. Data Model

<New or changed persistence. Omit if there's no DB change. On the server this maps
to `server/prisma/schema.prisma` — use the `database-design` skill to implement it.>

```
<table / model>
  <field>   <type>   <constraints / notes>
```

---

## 6. Non-Functional Requirements

<Only those that apply: rate limiting, performance budgets, availability,
observability, accessibility, i18n.>

- <e.g. `/auth/login` rate-limited to 10 req/min/IP; `429` on breach.>

---

## 7. Security Considerations

<Authn/authz, secret handling, input validation, transport, CSRF/XSS, data
exposure / enumeration. Omit only if the feature has no security surface.>

- <e.g. Passwords hashed with Argon2id; plaintext never logged or persisted.>

---

## 8. Edge Cases

<Boundaries, error/empty/loading states, concurrency, permissions, limits.>

- <e.g. Verifying with an expired token → clear error + a resend path.>

---

## 9. Acceptance Criteria

<Testable conditions that define "done". These drive the `write-test` skill — keep
each one verifiable and traceable to a US/FR above.>

- [ ] Given <context>, when <action>, then <expected outcome>.

---

## 10. Open Questions

<Unresolved decisions; assign an owner where possible.>

- <e.g. Hard gate (must verify before login) vs. soft gate (restricted until verified)?>
