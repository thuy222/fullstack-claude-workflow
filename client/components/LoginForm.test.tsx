import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, userEvent, waitFor } from "@/test/test-utils";
import LoginForm from "./LoginForm";

// Component test for the login form. The auth action (`useAuth().login`) and the
// router are mocked so the form is tested in isolation: validation, loading
// state, error display, and the success → redirect contract.
// Traces: specs/authentication.md §9 (AC-4, AC-5, AC-8) and FR-ui.2/3/4/5.
const { loginMock, pushMock } = vi.hoisted(() => ({
  loginMock: vi.fn(),
  pushMock: vi.fn(),
}));

vi.mock("@/components/AuthProvider", () => ({
  useAuth: () => ({ login: loginMock }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    loginMock.mockReset();
    pushMock.mockReset();
  });

  // FR-ui.2: the form renders its fields and a submit button.
  it("renders email and password fields and a submit button", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  // AC-8, FR-ui.3: invalid input shows inline errors and never calls the API.
  it("shows an error for a malformed email and does not call login", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "not-an-email");
    await user.type(screen.getByLabelText(/password/i), "correct horse battery");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("does not call login when fields are empty", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(loginMock).not.toHaveBeenCalled();
  });

  // FR-ui.3: a failed API call surfaces a top-level error message.
  it("displays a top-level error when login is rejected", async () => {
    const user = userEvent.setup();
    loginMock.mockRejectedValue(
      Object.assign(new Error("Email or password is incorrect."), {
        code: "INVALID_CREDENTIALS",
      }),
    );
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "ada@example.com");
    await user.type(screen.getByLabelText(/password/i), "correct horse battery");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText(/incorrect/i)).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  // FR-ui.5: the submit button is disabled while the request is in flight.
  it("disables the submit button while the request is in flight", async () => {
    const user = userEvent.setup();
    loginMock.mockReturnValue(new Promise(() => {})); // never resolves
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "ada@example.com");
    await user.type(screen.getByLabelText(/password/i), "correct horse battery");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /log in/i })).toBeDisabled(),
    );
  });

  // AC-8 (success), FR-ui.4: valid submit calls login then redirects to "/".
  it("calls login with the credentials and redirects to / on success", async () => {
    const user = userEvent.setup();
    loginMock.mockResolvedValue(undefined);
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "ada@example.com");
    await user.type(screen.getByLabelText(/password/i), "correct horse battery");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() =>
      expect(loginMock).toHaveBeenCalledWith({
        email: "ada@example.com",
        password: "correct horse battery",
      }),
    );
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/"));
  });
});
