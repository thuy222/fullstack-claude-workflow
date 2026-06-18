// Client for the NestJS auth endpoints (specs/authentication.md §4). Every call
// returns the parsed JSON on success; on a non-OK response it throws an Error
// whose `.message` is the server's human-readable message and whose `.code` is
// the uniform error code (INVALID_CREDENTIALS, EMAIL_TAKEN, …) so the UI can
// surface a top-level message. Token storage lives in AuthProvider, not here.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

export interface AuthResult {
  accessToken: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name?: string;
}

/** Error carrying the uniform `code` from the API error shape. */
export class AuthApiError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = "AuthApiError";
    this.code = code;
  }
}

async function parseOrThrow<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const code = body?.error?.code ?? "UNKNOWN";
    const message =
      body?.error?.message ?? "Something went wrong. Please try again.";
    throw new AuthApiError(message, code);
  }
  return body as T;
}

export async function login(
  credentials: LoginCredentials,
): Promise<AuthResult> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return parseOrThrow<AuthResult>(res);
}

export async function register(
  credentials: RegisterCredentials,
): Promise<AuthResult> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return parseOrThrow<AuthResult>(res);
}

export async function getCurrentUser(token: string): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await parseOrThrow<{ user: User }>(res);
  return body.user;
}
