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

interface LoginFields {
  email: string;
  password: string;
}

/**
 * Login screen (specs/authentication.md FR-ui.2–5). Inline validation runs
 * before any request; a valid submit calls `useAuth().login` and redirects to
 * "/" on success, or surfaces the rejection message as a top-level error.
 */
export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFields>({ defaultValues: { email: "", password: "" } });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await login(values);
      router.push("/");
    } catch (err) {
      setServerError(
        err instanceof Error
          ? err.message
          : "Unable to log in. Please try again.",
      );
    }
  });

  return (
    <AuthLayout badge="Welcome back to the platform">
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
        Welcome back
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
        Log in
      </Typography>
      <Typography sx={{ fontWeight: 100, color: "text.secondary", mb: 3.5 }}>
        Enter your details to access your account.
      </Typography>

      {serverError ? <FormErrorAlert message={serverError} /> : null}

      <Box component="form" onSubmit={onSubmit} noValidate>
        <InputControl<LoginFields>
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
        <InputControl<LoginFields>
          name="password"
          control={control}
          label="Password"
          type="password"
          placeholder="••••••••"
          rules={{ required: "Enter your password." }}
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
          Log in
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
        New to EFKT?{" "}
        <Link
          href="/register"
          sx={{ color: "primary.main", fontWeight: 600 }}
          underline="none"
        >
          Create an account
        </Link>
      </Typography>
    </AuthLayout>
  );
}

export default LoginForm;
