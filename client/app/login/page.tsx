"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import LoginForm from "@/components/LoginForm";

/**
 * /login route. An already-authenticated visitor is redirected to the app's
 * landing page (specs/authentication.md §8 edge case); everyone else sees the
 * login form.
 */
export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);

  return <LoginForm />;
}
