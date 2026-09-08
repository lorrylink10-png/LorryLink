"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthError } from "@/components/auth/AuthError";
import { authErrorMessage } from "@/components/auth/auth-messages";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput, FormField } from "@/components/ui/FormControls";
import { appUrl } from "@/lib/site-url";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSent(false);

    const trimmedEmail = email.trim();

    if (!isValidEmail(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const redirectUrl = new URL(appUrl("/auth/callback"));
    redirectUrl.searchParams.set("next", "/auth/update-password");

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: redirectUrl.toString(),
    });

    setLoading(false);

    if (resetError) {
      setError(authErrorMessage(resetError.message));
      return;
    }

    setSent(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AuthError message={error} />
      {sent ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-3 text-sm font-semibold leading-6 text-[var(--success)]">
          Password reset instructions have been sent.
        </div>
      ) : null}

      <FormField label="Email Address">
        <AppInput
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          placeholder="you@example.com"
        />
      </FormField>

      <AppButton type="submit" className="w-full" disabled={loading}>
        {loading ? "Sending instructions..." : "Send Reset Instructions"}
      </AppButton>

      <p className="text-center text-sm">
        <Link href="/login" className="font-bold text-[var(--brand-blue)]">
          Back to Sign In
        </Link>
      </p>
    </form>
  );
}

