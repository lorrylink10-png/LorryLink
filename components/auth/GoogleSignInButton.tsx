"use client";

import { useState } from "react";
import { appUrl } from "@/lib/site-url";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type GoogleSignInButtonProps = {
  onError: (message: string) => void;
};

function GoogleIcon() {
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-sm font-bold text-[var(--brand-blue)]">
      G
    </span>
  );
}

export function GoogleSignInButton({ onError }: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignIn() {
    setLoading(true);
    onError("");

    const supabase = createSupabaseBrowserClient();
    const redirectTo = appUrl("/auth/callback");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (error) {
      setLoading(false);
      onError("Unable to continue with Google. Please check your Supabase OAuth settings and try again.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="touch-target flex w-full items-center justify-center gap-3 rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm font-bold text-[var(--brand-navy)] transition hover:border-[var(--brand-blue)] hover:bg-blue-50 disabled:pointer-events-none disabled:opacity-60"
    >
      <GoogleIcon />
      {loading ? "Continuing with Google..." : "Continue with Google"}
    </button>
  );
}

