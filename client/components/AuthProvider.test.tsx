import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, userEvent } from "@/test/test-utils";
import { AuthProvider, useAuth } from "./AuthProvider";
import * as authApi from "@/lib/auth-api";

// Tests the auth context: it owns token persistence (localStorage `auth_token`)
// and user state, calling the `@/lib/auth-api` client at the boundary (mocked
// here). A small Probe component drives login/register/logout via `useAuth()`.
// Traces: specs/authentication.md §9 (AC-9) and FR-ui.4, FR-logout.1, US-3.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/auth-api", () => ({
  login: vi.fn(),
  register: vi.fn(),
  getCurrentUser: vi.fn(),
}));

const TOKEN_KEY = "auth_token";
const fakeUser = {
  id: "user-1",
  email: "ada@example.com",
  name: "Ada",
  createdAt: "2026-06-18T10:00:00.000Z",
};

function Probe() {
  const { user, token, login, register, logout } = useAuth();
  return (
    <div>
      <p>user: {user ? user.email : "anon"}</p>
      <p>token: {token ? "present" : "absent"}</p>
      <button
        onClick={() =>
          login({ email: "ada@example.com", password: "correct horse battery" })
        }
      >
        do-login
      </button>
      <button
        onClick={() =>
          register({
            email: "ada@example.com",
            password: "correct horse battery",
            name: "Ada",
          })
        }
      >
        do-register
      </button>
      <button onClick={() => logout()}>do-logout</button>
    </div>
  );
}

const renderProvider = () =>
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );

describe("AuthProvider / useAuth", () => {
  beforeEach(() => {
    vi.mocked(authApi.login).mockReset();
    vi.mocked(authApi.register).mockReset();
    vi.mocked(authApi.getCurrentUser).mockReset();
    localStorage.clear();
  });

  // FR-ui.4: login success stores the token and populates user state.
  it("stores the token in localStorage and sets the user after login", async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.login).mockResolvedValue({
      accessToken: "tok-123",
      user: fakeUser,
    });
    renderProvider();

    expect(screen.getByText("user: anon")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "do-login" }));

    expect(await screen.findByText("user: ada@example.com")).toBeInTheDocument();
    expect(screen.getByText("token: present")).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_KEY)).toBe("tok-123");
  });

  // FR-ui.4: register success behaves like login (auto-login).
  it("stores the token and sets the user after register", async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.register).mockResolvedValue({
      accessToken: "tok-456",
      user: fakeUser,
    });
    renderProvider();

    await user.click(screen.getByRole("button", { name: "do-register" }));

    expect(await screen.findByText("user: ada@example.com")).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_KEY)).toBe("tok-456");
  });

  // AC-9, FR-logout.1: logout clears the token and user state.
  it("clears the token and user on logout", async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.login).mockResolvedValue({
      accessToken: "tok-123",
      user: fakeUser,
    });
    renderProvider();

    await user.click(screen.getByRole("button", { name: "do-login" }));
    await screen.findByText("user: ada@example.com");

    await user.click(screen.getByRole("button", { name: "do-logout" }));

    expect(await screen.findByText("user: anon")).toBeInTheDocument();
    expect(screen.getByText("token: absent")).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  // US-3: an existing token in localStorage is hydrated into user state on mount.
  it("hydrates the user from an existing token on mount", async () => {
    localStorage.setItem(TOKEN_KEY, "tok-existing");
    vi.mocked(authApi.getCurrentUser).mockResolvedValue(fakeUser);
    renderProvider();

    expect(await screen.findByText("user: ada@example.com")).toBeInTheDocument();
    expect(vi.mocked(authApi.getCurrentUser)).toHaveBeenCalledWith("tok-existing");
  });
});
