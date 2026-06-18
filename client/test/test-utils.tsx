import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "@/theme";

/**
 * Test render helper. Wraps the UI in the same MUI provider stack the app uses
 * at runtime (see `components/ThemeRegistry.tsx`) so component tests see the
 * real theme. Prefer importing `render`/`screen`/`userEvent` from here instead
 * of `@testing-library/react` directly.
 */
function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: Providers, ...options });
}

// Re-export the RTL API, overriding `render` with the provider-wrapped version.
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
export { customRender as render };
