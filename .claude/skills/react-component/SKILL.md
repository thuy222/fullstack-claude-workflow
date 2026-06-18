---
name: react-component
description: Scaffold a reusable React component (e.g. InputControl, Button, Card) into the client/components/ folder, built on Material UI. Use when the user asks to create, scaffold, or add a reusable UI component.
argument-hint: <ComponentName> [prop:type ...]
---

# react-component

Scaffold a reusable, typed React component built on **Material UI (MUI)** into the front-end app's `client/components/` folder.

## Before you write code

1. If the component uses any Next.js-specific API (routing, `next/image`, `next/link`, server actions, etc.), **read the relevant guide under `client/node_modules/next/dist/docs/01-app/` first** — the front end runs Next.js 16, which has breaking changes vs. older versions (see `client/CLAUDE.md`).
2. Determine the component **name** (PascalCase) and its **props**. If the user didn't specify them, ask briefly, or infer sensible defaults from the request and state your assumptions.

## Conventions (match the existing project)

- **Location:** `client/components/<ComponentName>.tsx`, imported via the `@/*` alias (mapped to the client root), e.g. `import InputControl from "@/components/InputControl"`.
- **Build on MUI:** compose MUI primitives (`TextField`, `Button`, `Box`, etc.) rather than raw HTML. Extend the relevant MUI props type so the component stays flexible.
- **Typed props:** export a named `interface <Name>Props`. Prefer extending MUI props (e.g. `extends TextFieldProps`) and `Omit<>`-ing anything you override.
- **Client boundary:** add `'use client'` at the top **only** when the component uses state, effects, refs, or event handlers. Presentational components stay server components.
- **Exports:** provide both a named export and a default export.
- **Styling:** use the MUI `sx` prop / theme tokens for component styling; Tailwind utilities are fine for layout wrappers. The Geist font is already wired into the MUI theme (`theme.ts`).
- **Strict TS:** no `any`; the project is in strict mode.

## Reference pattern — `InputControl`

A labeled, validated text input wrapping MUI `TextField`:

```tsx
"use client";

import TextField, { type TextFieldProps } from "@mui/material/TextField";

export interface InputControlProps
  extends Omit<TextFieldProps, "error"> {
  /** Error message to display; presence also flags the field as invalid. */
  errorText?: string;
}

export function InputControl({ errorText, helperText, ...props }: InputControlProps) {
  return (
    <TextField
      variant="outlined"
      fullWidth
      error={Boolean(errorText)}
      helperText={errorText ?? helperText}
      {...props}
    />
  );
}

export default InputControl;
```

## After creating

- Verify it type-checks (`npm --prefix client exec tsc -- --noEmit`) and, if useful, show the user a short usage snippet.
- The PostToolUse hook auto-formats the file with Prettier — no need to format manually.
