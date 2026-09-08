"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthError } from "@/components/auth/AuthError";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { RoleSelector } from "@/components/auth/RoleSelector";
import { useAuth } from "@/components/auth/AuthProvider";
import { authErrorMessage } from "@/components/auth/auth-messages";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput, FormField } from "@/components/ui/FormControls";
import { appUrl } from "@/lib/site-url";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types/domain";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function RegisterForm() {
  const router = useRouter();
  const auth = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();

    if (!role) {
      setError("Choose how you will use Lorry Link.");
      return;
    }

    if (!trimmedName || !trimmedPhone || !trimmedEmail || !password || !confirmPassword) {
      setError("Complete all required fields.");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        emailRedirectTo: appUrl("/auth/callback"),
        data: {
          full_name: trimmedName,
          phone: trimmedPhone,
          role,
        },
      },
    });

    if (signUpError) {
      setLoading(false);
      setError(authErrorMessage(signUpError.message));
      return;
    }

    if (!data.session) {
      router.replace(`/auth/check-email?email=${encodeURIComponent(trimmedEmail)}`);
      return;
    }

    const state = await auth.refreshAuth();
    router.replace(role === "driver" ? "/onboarding/driver" : state.destination);
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <h2 className="text-base font-bold text-[var(--brand-navy)]">How will you use Lorry Link?</h2>
        <RoleSelector value={role} onChange={setRole} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthError message={error} />

        {role === "driver" ? (
          <AppCard className="space-y-2 bg-blue-50 shadow-none">
            <p className="text-sm font-bold text-[var(--brand-blue)]">Step 1 of 2: Account</p>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              Driver and lorry details are completed after email verification.
            </p>
          </AppCard>
        ) : null}

        <FormField label="Full Name *">
          <AppInput value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" />
        </FormField>
        <FormField label="Phone Number *">
          <AppInput value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" />
        </FormField>
        <FormField label="Email Address *">
          <AppInput
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />
        </FormField>
        <PasswordInput
          label="Password *"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
        />
        <PasswordInput
          label="Confirm Password *"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          autoComplete="new-password"
        />

        <AppButton type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </AppButton>
      </form>

      <div className="flex items-center gap-3 py-1">
        <span className="h-px flex-1 bg-[var(--border)]" />
        <span className="text-xs font-bold uppercase text-[var(--text-secondary)]">OR</span>
        <span className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <GoogleSignInButton onError={setError} />

      <p className="text-center text-sm text-[var(--text-secondary)]">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-[var(--brand-blue)]">
          Sign In
        </Link>
      </p>
    </div>
  );
}
