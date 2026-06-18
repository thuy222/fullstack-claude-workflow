import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/test-utils";
import Home from "./page";

// Smoke test proving the Vitest + RTL + MUI stack works. The `write-test` skill
// generates feature tests in this same shape (colocated `*.test.tsx`).
describe("Home page", () => {
  it("renders the getting-started heading", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: /to get started/i }),
    ).toBeInTheDocument();
  });
});
