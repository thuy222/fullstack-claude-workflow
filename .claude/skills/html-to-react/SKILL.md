---
name: html-to-react
description: Convert an HTML file into reusable, typed React components for the client (Next.js 16 + MUI + Tailwind) — reusing existing components and theme tokens, binding every input with React Hook Form, never hard-coding colors, and satisfying provided test cases. Use when given an HTML file or mockup to turn into React.
argument-hint: <source.html> [spec] [test-file] [target.tsx]
---

# html-to-react

Convert an **HTML file** into **reusable** React for the front-end app (`client/` — Next.js 16, React
19, MUI v9, Tailwind v4). The guiding rule is **reuse over rewrite**: inventory what already exists and
compose it; never reinvent a primitive or copy-paste markup. This is the build step that pairs with
`generate-spec` (the spec) and `write-test` (the tests): given the HTML + tests, produce a component
that passes them.

## Inputs

1. **Source HTML** (required) — path to the `.html` file (or a snippet) to convert.
2. **Spec / business logic** (optional) — a `specs/*.md` path or inline text describing behaviour,
   validation rules, and data shape. Read it for intent the static HTML can't express.
3. **Test case(s)** (optional) — a Vitest `*.test.tsx` and/or Playwright `*.spec.ts` path (usually
   produced by `write-test`). **These are the contract** — see "Test-driven" below.
4. **Target file** (optional) — if given, write the top-level component **into that file**. Otherwise
   derive the path: a reusable piece → `client/components/<Name>.tsx`; a full page/route → an `app/`
   route.

If the target or intent is ambiguous, ask one brief question rather than guessing.

## Before generating — reuse-first & test-aware

1. Read **`client/CLAUDE.md`** for app conventions.
2. **Inventory what exists** so you reuse it: list `client/components/` (and any `client/hooks/`,
   `client/features/`). Note every component you could compose instead of authoring.
3. Read **`client/theme.ts`** and **`client/app/globals.css`** to learn the available design tokens
   (MUI palette/typography via `sx`, Tailwind `@theme` tokens like `bg-foreground`).
4. Read the **`react-component`** skill — new primitives must follow its conventions.
5. **If tests were provided, read them first.** Derive the component's **name, props/API, accessible
   roles/labels, and behaviours** from what the tests query and assert — e.g.
   `getByRole('textbox', { name: /email/i })`, a submit handler, a validation message. The generated
   component must make those queries resolve and those assertions pass.

Decide **reuse-vs-create for every element before writing a line.**

## HTML → JSX conversion rules

- `class` → `className`, `for` → `htmlFor`, `tabindex` → `tabIndex`, etc.; self-close void elements;
  boolean attributes become `{true}`; inline `on*="…"` → React handlers; decode HTML entities; keep
  SVGs as JSX (camelCase attrs).
- `style="color:…"` → MUI **`sx`** (component styling) or a **Tailwind** utility (layout). Never keep
  inline hex (see "Theme & colors").
- `<img>` → `next/image`; internal `<a href="/…">` → `next/link` (or MUI `Link`).

## Map semantic HTML → reusable components

- `<input>` / `<textarea>` → reusable **`InputControl`** (RHF-bound).
- `<select>` → reusable **`SelectControl`** (RHF-bound).
- `<button>` → reusable/MUI **`Button`**; tables, dialogs, tabs, etc. → MUI components.
- **Inputs and selects MUST come from reusable components — never a raw `<input>` or an inline
  `<TextField>` scattered through the markup.**

## Reuse & no-duplication (core rule)

For each control or common element:

- A suitable reusable component **exists** → import it (`@/components/…`).
- It **doesn't exist** → create it **once** in `client/components/` per the `react-component` skill
  (typed props, named + default export), then import it. Do **not** inline a one-off copy.

Factor repeated markup into a small subcomponent or a `.map()` over data. No copy-pasted blocks.

## Forms — React Hook Form (every input binds to a form control)

Every input is bound through **React Hook Form**. Install it if absent:
`npm --prefix client install react-hook-form`.

Reusable field wrappers encapsulate the `Controller` logic with `useController`, are **generic over
`<T extends FieldValues>`**, and never double-register. Example primitive:

```tsx
"use client";

import { useController, type Control, type FieldValues, type Path } from "react-hook-form";
import TextField, { type TextFieldProps } from "@mui/material/TextField";

export interface InputControlProps<T extends FieldValues>
  extends Omit<TextFieldProps, "name" | "error" | "defaultValue"> {
  name: Path<T>;
  control: Control<T>;
}

export function InputControl<T extends FieldValues>({
  name,
  control,
  helperText,
  ...props
}: InputControlProps<T>) {
  const { field, fieldState } = useController({ name, control });
  return (
    <TextField
      {...field}
      {...props}
      fullWidth
      error={Boolean(fieldState.error)}
      helperText={fieldState.error?.message ?? helperText}
    />
  );
}

export default InputControl;
```

The form container owns `useForm` and passes `control` down; validation lives in `rules`/a resolver:

```tsx
"use client";
import { useForm } from "react-hook-form";
import InputControl from "@/components/InputControl";

interface LoginForm { email: string; password: string }

export function LoginForm() {
  const { control, handleSubmit } = useForm<LoginForm>({ defaultValues: { email: "", password: "" } });
  const onSubmit = handleSubmit((data) => {/* … */});
  return (
    <form onSubmit={onSubmit} noValidate>
      <InputControl<LoginForm> name="email" control={control} label="Email" type="email" />
      {/* … */}
    </form>
  );
}
```

RHF-bound components are interactive, so they carry `'use client'`.

## Theme & colors — no hard-coding

- Map HTML colors to **theme tokens**: MUI `sx` (`color: 'primary.main'`, `'text.secondary'`,
  `bgcolor: 'background.paper'`) for components; Tailwind tokens (`bg-foreground`, `text-background`)
  for layout.
- **If the design needs a color the theme doesn't define, add a semantic token to `client/theme.ts`**
  (extend `palette` or add a custom key) and reference it — do **not** write a literal hex/rgb in a
  component. Apply the same instinct to repeated spacing/typography.

## Component structure (best practices)

- Separate **presentational markup from logic**; lift state/effects/data into **custom hooks**
  (`client/hooks/` or colocated) rather than fattening the component.
- Keep components **small and single-purpose** (≈<200 lines); decompose large HTML into sub-components
  (atomic). One component per file.
- `'use client'` **only** where interactive (forms, state, handlers); keep purely presentational pieces
  as Server Components.
- `@/*` imports, strict TS (no `any`), named **and** default exports.

## Test-driven (when tests are provided)

Generate the component to **satisfy the provided tests** — match the queried roles/labels/text and the
asserted behaviour. Then **run them** and iterate until green:

- Vitest: `npm --prefix client run test -- <path/to/file.test.tsx>`
- Playwright: `npm --prefix client run test:e2e` (needs the app served; see `client/CLAUDE.md`).

If a test encodes behaviour that the HTML/spec don't define, **report the gap** instead of guessing. If
**no** tests were given, suggest running `write-test` first (test-first) or afterward.

## Output & after

1. Write the top-level component (into the target file if provided) plus any new reusable
   primitives/hooks created along the way.
2. Type-check: `npm --prefix client exec tsc -- --noEmit` (the Prettier PostToolUse hook formats).
3. Run any provided tests (above).
4. **Report**: files created/modified; **which existing components were reused**; which new primitives
   were created and why; **which theme tokens were added**; and the **test result** (pass, or which
   assertions remain unmet and why).
5. Suggest the **`review-react-code`** agent for a review.

## Restrictions (recap)

- **Reuse before create**; never reinvent an existing primitive.
- **No duplicated markup** — extract shared pieces.
- **Inputs/selects only via reusable, RHF-bound components.**
- **Zero hard-coded colors** — theme tokens only; add a token when one is missing.
