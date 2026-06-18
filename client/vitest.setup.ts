// Runs before each test file (see vitest.config.mts `setupFiles`).
// Adds jest-dom matchers (toBeInTheDocument, toHaveAttribute, …) and unmounts
// React trees between tests so they stay isolated.
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});
