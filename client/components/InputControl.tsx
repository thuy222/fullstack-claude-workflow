"use client";

import { useId } from "react";
import {
  useController,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import FormHelperText from "@mui/material/FormHelperText";
import OutlinedInput, {
  type OutlinedInputProps,
} from "@mui/material/OutlinedInput";

export interface InputControlProps<T extends FieldValues> extends Omit<
  OutlinedInputProps,
  "name" | "error" | "defaultValue" | "id"
> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  /** Optional suffix rendered after the label, e.g. "(optional)". */
  labelHint?: string;
  /** RHF validation rules. */
  rules?: RegisterOptions<T, Path<T>>;
  /** Helper text shown below the field when there is no validation error. */
  helperText?: string;
}

/**
 * RHF-bound text field with a top-aligned label, matching the EFKT auth
 * mockup: label above a rounded outlined input, with inline validation text
 * (vermilion via the `error` palette) below. Generic over the form's field
 * values; binds through `useController` so it never double-registers.
 */
export function InputControl<T extends FieldValues>({
  name,
  control,
  label,
  labelHint,
  rules,
  helperText,
  ...inputProps
}: InputControlProps<T>) {
  const id = useId();
  const { field, fieldState } = useController({ name, control, rules });
  const errorMessage = fieldState.error?.message;
  const describedBy = `${id}-text`;

  return (
    <FormControl fullWidth error={Boolean(errorMessage)} sx={{ mb: 2 }}>
      <FormLabel
        htmlFor={id}
        sx={{
          fontSize: 13,
          fontWeight: 600,
          color: "text.secondary",
          mb: 0.75,
          "&.Mui-focused": { color: "text.secondary" },
        }}
      >
        {label}
        {labelHint ? (
          <Box component="span" sx={{ fontWeight: 400, opacity: 0.7, ml: 0.5 }}>
            {labelHint}
          </Box>
        ) : null}
      </FormLabel>
      <OutlinedInput
        {...field}
        {...inputProps}
        id={id}
        aria-describedby={errorMessage || helperText ? describedBy : undefined}
        sx={{
          borderRadius: "var(--radius-field)",
          fontSize: 15,
          backgroundColor: "background.paper",
          ...inputProps.sx,
        }}
      />
      {errorMessage || helperText ? (
        <FormHelperText id={describedBy} sx={{ mx: 0, fontSize: 12 }}>
          {errorMessage ?? helperText}
        </FormHelperText>
      ) : null}
    </FormControl>
  );
}

export default InputControl;
