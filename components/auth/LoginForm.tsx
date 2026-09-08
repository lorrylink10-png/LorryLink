"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthError } from "@/components/auth/AuthError";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput, FormField } from "@/components/ui/FormControls";
import { authErrorMessage } from "@/components/auth/auth-messages";
import { useAuth } from "@/components/auth/AuthProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

type LoginFormProps = {
  initialError?: string | null;
  initialMessage?: string | null;
};

export function LoginForm({ initialError = null, initialMessage = null }: LoginFormProps) {
  const router = useRouter();
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError("Enter your email and password.");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (signInError) {
      setLoading(false);
      setError(authErrorMessage(signInError.message));
      return;
    }

    const state = await auth.refreshAuth();
    router.replace(state.destination);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {initialMessage ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-3 text-sm font-semibold leading-6 text-[var(--success)]">
          {initialMessage}
        </div>
      ) : null}
      <AuthError message={error} />

      <FormField label="Email">
        <AppInput
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />
      </FormField>

      <PasswordInput
        label="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="current-password"
        placeholder="Enter password"
      />

      <AppButton type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </AppButton>

      <div className="text-center">
        <Link href="/forgot-password" className="text-sm font-bold text-[var(--brand-blue)]">
          Forgot password?
        </Link>
      </div>

      <div className="flex items-center gap-3 py-1">
        <span className="h-px flex-1 bg-[var(--border)]" />
        <span className="text-xs font-bold uppercase text-[var(--text-secondary)]">OR</span>
        <span className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <GoogleSignInButton onError={setError} />

      <p className="pt-2 text-center text-sm text-[var(--text-secondary)]">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-bold text-[var(--brand-blue)]">
          Create Account
        </Link>
      </p>
    </form>
  );
}
