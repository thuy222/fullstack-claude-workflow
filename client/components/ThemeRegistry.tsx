"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "@/theme";

/**
 * Client-side MUI provider stack. Lives in its own client component so the
 * root layout can stay a Server Component. AppRouterCacheProvider collects the
 * emotion styles generated during SSR streaming; ThemeProvider applies the
 * shared theme; CssBaseline normalizes browser defaults.
 */
export default function ThemeRegistry({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
