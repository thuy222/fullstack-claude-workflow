import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import Home from "./page";

// Smoke test proving the Vitest + RTL + MUI stack works. The home page reads
// the auth context, so `useAuth` is mocked to an anonymous session here.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/components/AuthProvider", () => ({
  useAuth: () => ({ user: null, logout: vi.fn() }),
}));

describe("Home page", () => {
  it("renders the EFKT welcome heading for an anonymous visitor", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: /welcome to efkt/i }),
    ).toBeInTheDocument();
  });
});
