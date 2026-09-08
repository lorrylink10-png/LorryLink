"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthError } from "@/components/auth/AuthError";
import { useAuth } from "@/components/auth/AuthProvider";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { authErrorMessage } from "@/components/auth/auth-messages";
import { AppButton } from "@/components/ui/AppButton";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function UpdatePasswordForm() {
  const router = useRouter();
  const auth = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

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
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setLoading(false);
      setError(authErrorMessage(updateError.message));
      return;
    }

    await supabase.auth.signOut();
    await auth.refreshAuth();
    router.replace("/login?message=password-updated");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AuthError message={error} />
      <PasswordInput
        label="New Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="new-password"
      />
      <PasswordInput
        label="Confirm New Password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        autoComplete="new-password"
      />
      <AppButton type="submit" className="w-full" disabled={loading}>
        {loading ? "Updating password..." : "Update Password"}
      </AppButton>
    </form>
  );
}

