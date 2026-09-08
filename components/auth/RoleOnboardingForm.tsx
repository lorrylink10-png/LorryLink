"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthError } from "@/components/auth/AuthError";
import { useAuth } from "@/components/auth/AuthProvider";
import { RoleSelector } from "@/components/auth/RoleSelector";
import { authErrorMessage } from "@/components/auth/auth-messages";
import { AppButton } from "@/components/ui/AppButton";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types/domain";

export function RoleOnboardingForm() {
  const router = useRouter();
  const auth = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!role) {
      setError("Choose how you will use Lorry Link.");
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error: rpcError } = await supabase.rpc("set_initial_user_role", {
      p_role: role,
    });

    if (rpcError) {
      const state = await auth.refreshAuth();
      if (state.user && state.profile?.role) {
        router.replace(state.destination);
        return;
      }

      setLoading(false);
      setError(authErrorMessage(rpcError.message));
      return;
    }

    await auth.refreshAuth();
    router.replace(role === "driver" ? "/onboarding/driver" : "/customer/home");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AuthError message={error} />
      <RoleSelector value={role} onChange={setRole} />
      <AppButton type="submit" className="w-full" disabled={loading}>
        {loading ? "Saving role..." : "Continue"}
      </AppButton>
    </form>
  );
}

