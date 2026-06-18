"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useAuth } from "@/components/AuthProvider";
import AuthLayout from "@/components/AuthLayout";
import InputControl from "@/components/InputControl";
import FormErrorAlert from "@/components/FormErrorAlert";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RegisterFields {
  email: string;
  password: string;
  name: string;
}

/**
 * Registration screen (specs/authentication.md FR-ui.1,3–5). Inline validation
 * (email format, password length) runs before any request; a valid submit
 * calls `useAuth().register` and redirects to "/" on success, or surfaces the
 * rejection (e.g. EMAIL_TAKEN) as a top-level error.
 */
export function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterFields>({
    defaultValues: { email: "", password: "", name: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await register(values);
      router.push("/");
    } catch (err) {
      setServerError(
        err instanceof Error
          ? err.message
          : "Unable to create your account. Please try again.",
      );
    }
  });

  return (
    <AuthLayout badge="Join the EFKT platform">
      <Typography
        component="p"
        sx={{
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "primary.main",
        }}
      >
        Get started
      </Typography>
      <Typography
        component="h1"
        sx={{
          fontSize: 32,
          fontWeight: 600,
          letterSpacing: "-0.015em",
          mt: 1.25,
          mb: 0.75,
        }}
      >
        Create your account
      </Typography>
      <Typography sx={{ fontWeight: 100, color: "text.secondary", mb: 3.5 }}>
        Free to start. No card required.
      </Typography>

      {serverError ? <FormErrorAlert message={serverError} /> : null}

      <Box component="form" onSubmit={onSubmit} noValidate>
        <InputControl<RegisterFields>
          name="name"
          control={control}
          label="Name"
          labelHint="(optional)"
          placeholder="Ada Lovelace"
        />
        <InputControl<RegisterFields>
          name="email"
          control={control}
          label="Email"
          type="email"
          placeholder="name@efkt.com"
          rules={{
            required: "Enter a valid email address.",
            pattern: {
              value: EMAIL_PATTERN,
              message: "Enter a valid email address.",
            },
          }}
        />
        <InputControl<RegisterFields>
          name="password"
          control={control}
          label="Password"
          type="password"
          placeholder="••••••••"
          helperText="8–72 characters."
          rules={{
            required: "Must be at least 8 characters.",
            minLength: {
              value: 8,
              message: "Must be at least 8 characters.",
            },
            maxLength: {
              value: 72,
              message: "Must be at most 72 characters.",
            },
          }}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          loading={isSubmitting}
          endIcon={<ArrowForwardIcon />}
          sx={{
            mt: 2.75,
            borderRadius: 999,
            py: 1.75,
            textTransform: "none",
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          Create account
        </Button>
      </Box>

      <Typography
        sx={{
          mt: 2.75,
          textAlign: "center",
          fontWeight: 100,
          color: "text.secondary",
        }}
      >
        Already have an account?{" "}
        <Link
          href="/login"
          sx={{ color: "primary.main", fontWeight: 600 }}
          underline="none"
        >
          Log in
        </Link>
      </Typography>
    </AuthLayout>
  );
}

export default RegisterForm;
