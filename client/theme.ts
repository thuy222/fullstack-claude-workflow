"use client";

import { createTheme } from "@mui/material/styles";

// MUI theme for the app, aligned with the EFKT Design Katalog. Brand colors are
// declared as CSS variables in app/globals.css (`--efkt-*`); the palette below
// references them so there is a single source of truth and no inlined hex in
// components. Typography is wired to Be Vietnam Pro (loaded via next/font in
// app/layout.tsx and exposed as the --font-be-vietnam-pro CSS variable).

// Extend the MUI palette with the EFKT brand tokens so they can be referenced
// from `sx` via `theme.palette.efkt.*`.
declare module "@mui/material/styles" {
  interface Palette {
    efkt: {
      vermilion: string;
      teaRose: string;
      delftBlue: string;
      antiFlash: string;
      inkMuted: string;
      errorInk: string;
      lineStrong: string;
    };
  }
  interface PaletteOptions {
    efkt?: Palette["efkt"];
  }
}

const theme = createTheme({
  cssVariables: true,
  shape: {
    borderRadius: 12,
  },
  palette: {
    primary: {
      main: "#f1554c", // --efkt-vermilion
      contrastText: "#ffffff",
    },
    background: {
      default: "#e7e9ef", // --efkt-anti-flash
      paper: "#ffffff",
    },
    text: {
      primary: "#373b54", // --efkt-delft-blue
      secondary: "#6b6f82", // --color-ink-muted
    },
    efkt: {
      vermilion: "#f1554c",
      teaRose: "#fbccc9",
      delftBlue: "#373b54",
      antiFlash: "#e7e9ef",
      inkMuted: "#6b6f82",
      errorInk: "#b23a33",
      lineStrong: "rgba(55, 59, 84, 0.24)",
    },
  },
  typography: {
    fontFamily: "var(--font-be-vietnam-pro), Arial, Helvetica, sans-serif",
  },
});

export default theme;
