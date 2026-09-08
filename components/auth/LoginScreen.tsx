"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
import { PageLoading } from "@/components/pages/PageStates";

function LoginContent() {
  const searchParams = useSearchParams();

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to continue.">
      <LoginForm
        initialError={
          searchParams.get("error") === "auth_callback_failed"
            ? "Unable to complete sign in. Check the callback URL in Supabase and try again."
            : null
        }
        initialMessage={
          searchParams.get("message") === "password-updated"
            ? "Password updated. Please sign in again."
            : null
        }
      />
    </AuthCard>
  );
}

export function LoginScreen() {
  return (
    <Suspense fallback={<PageLoading />}>
      <LoginContent />
    </Suspense>
  );
}
