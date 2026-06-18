"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import RegisterForm from "@/components/RegisterForm";

/**
 * /register route. An already-authenticated visitor is redirected to the app's
 * landing page; everyone else sees the registration form.
 */
export default function RegisterPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);

  return <RegisterForm />;
}
