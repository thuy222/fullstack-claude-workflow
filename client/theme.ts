"use client";

import { createTheme } from "@mui/material/styles";

// MUI theme for the app. Typography is wired to the Geist font loaded via
// next/font in app/layout.tsx (exposed as the --font-geist-sans CSS variable).
const theme = createTheme({
  cssVariables: true,
  typography: {
    fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif",
  },
});

export default theme;
