import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, userEvent, waitFor } from "@/test/test-utils";
import RegisterForm from "./RegisterForm";

// Component test for the registration form. `useAuth().register` and the router
// are mocked so the form is exercised in isolation: validation (incl. password
// length), loading state, error display, and success → redirect.
// Traces: specs/authentication.md §9 (AC-1, AC-2, AC-8) and FR-ui.1/3/4/5.
const { registerMock, pushMock } = vi.hoisted(() => ({
  registerMock: vi.fn(),
  pushMock: vi.fn(),
}));

vi.mock("@/components/AuthProvider", () => ({
  useAuth: () => ({ register: registerMock }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe("RegisterForm", () => {
  beforeEach(() => {
    registerMock.mockReset();
    pushMock.mockReset();
  });

  // FR-ui.1: email, password, and (optional) name fields plus a submit button.
  it("renders email, password, and name fields and a submit button", () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create account|register|sign up/i }),
    ).toBeInTheDocument();
  });

  const submit = () =>
    screen.getByRole("button", { name: /create account|register|sign up/i });

  // AC-8, FR-ui.3: malformed email → inline error, API not called.
  it("shows an error for a malformed email and does not call register", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/email/i), "not-an-email");
    await user.type(screen.getByLabelText(/password/i), "correct horse battery");
    await user.click(submit());

    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
    expect(registerMock).not.toHaveBeenCalled();
  });

  // AC-3, FR-reg.3 mirrored client-side: password shorter than 8 → inline error.
  it("shows an error for a password shorter than 8 characters and does not call register", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/email/i), "ada@example.com");
    await user.type(screen.getByLabelText(/password/i), "short7!"); // 7 chars
    await user.click(submit());

    expect(await screen.findByText(/8 characters/i)).toBeInTheDocument();
    expect(registerMock).not.toHaveBeenCalled();
  });

  // AC-2, FR-ui.3: a 409 from the API surfaces a top-level error.
  it("displays a top-level error when registration is rejected (e.g. email taken)", async () => {
    const user = userEvent.setup();
    registerMock.mockRejectedValue(
      Object.assign(new Error("That email is already registered."), {
        code: "EMAIL_TAKEN",
      }),
    );
    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/email/i), "ada@example.com");
    await user.type(screen.getByLabelText(/password/i), "correct horse battery");
    await user.click(submit());

    expect(await screen.findByText(/already registered/i)).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  // FR-ui.5: submit disabled while the request is in flight.
  it("disables the submit button while the request is in flight", async () => {
    const user = userEvent.setup();
    registerMock.mockReturnValue(new Promise(() => {})); // never resolves
    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/email/i), "ada@example.com");
    await user.type(screen.getByLabelText(/password/i), "correct horse battery");
    await user.click(submit());

    await waitFor(() => expect(submit()).toBeDisabled());
  });

  // AC-1 (success), FR-ui.4: valid submit calls register then redirects to "/".
  it("calls register with the form values and redirects to / on success", async () => {
    const user = userEvent.setup();
    registerMock.mockResolvedValue(undefined);
    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/email/i), "ada@example.com");
    await user.type(screen.getByLabelText(/password/i), "correct horse battery");
    await user.type(screen.getByLabelText(/name/i), "Ada");
    await user.click(submit());

    await waitFor(() =>
      expect(registerMock).toHaveBeenCalledWith({
        email: "ada@example.com",
        password: "correct horse battery",
        name: "Ada",
      }),
    );
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/"));
  });
});
