"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as authApi from "@/lib/auth-api";
import type {
  LoginCredentials,
  RegisterCredentials,
  User,
} from "@/lib/auth-api";

const TOKEN_KEY = "auth_token";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Owns the client session: the access token (persisted in localStorage under
 * `auth_token`) and the resolved user. `login`/`register` call the auth-api,
 * persist the token, and populate user state; they re-throw on failure so the
 * forms can surface the error. On mount an existing token is exchanged for the
 * current user via `GET /auth/me` (FR-ui.4, FR-logout.1, US-3).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Hydrate the session from a stored token once, on mount.
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) return;
    setToken(stored);
    authApi
      .getCurrentUser(stored)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      });
  }, []);

  const persist = useCallback((result: authApi.AuthResult) => {
    localStorage.setItem(TOKEN_KEY, result.accessToken);
    setToken(result.accessToken);
    setUser(result.user);
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      persist(await authApi.login(credentials));
    },
    [persist],
  );

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      persist(await authApi.register(credentials));
    },
    [persist],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, login, register, logout }),
    [user, token, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthProvider;
