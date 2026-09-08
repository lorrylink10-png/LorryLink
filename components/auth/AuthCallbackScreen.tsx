"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { AppButton } from "@/components/ui/AppButton";
import { PageLoading } from "@/components/pages/PageStates";
import { getSafeRedirectPath } from "@/lib/auth/redirects";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function completeCallback() {
      const authError = searchParams.get("error");
      const code = searchParams.get("code");
      const next = getSafeRedirectPath(searchParams.get("next"), "/");

      if (authError) {
        router.replace("/login?error=auth_callback_failed");
        return;
      }

      const supabase = createSupabaseBrowserClient();

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          if (!cancelled) {
            setError("Unable to complete sign in. Check the callback URL in Supabase and try again.");
          }
          return;
        }
      }

      const nextState = await refreshAuth();

      if (cancelled) {
        return;
      }

      if (next === "/auth/update-password") {
        router.replace(next);
        return;
      }

      router.replace(nextState.destination);
    }

    void completeCallback();

    return () => {
      cancelled = true;
    };
  }, [refreshAuth, router, searchParams]);

  if (error) {
    return (
      <AuthCard title="Sign in failed" subtitle="The callback could not be completed.">
        <div className="space-y-4">
          <p className="text-sm leading-6 text-[var(--text-secondary)]">{error}</p>
          <AppButton href="/login" className="w-full">
            Back to Sign In
          </AppButton>
        </div>
      </AuthCard>
    );
  }

  return <PageLoading />;
}

export function AuthCallbackScreen() {
  return (
    <Suspense fallback={<PageLoading />}>
      <AuthCallbackContent />
    </Suspense>
  );
}

