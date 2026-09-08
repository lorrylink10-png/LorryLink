"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Mail } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { AppButton } from "@/components/ui/AppButton";
import { PageLoading } from "@/components/pages/PageStates";

function CheckEmailContent() {
  const email = useSearchParams().get("email");

  return (
    <AuthCard title="Check your email" subtitle="Verify your address to continue.">
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-[var(--brand-blue)]">
          <Mail size={26} aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-[var(--brand-navy)]">Verify your email</h2>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            We&apos;ve sent a verification link{email ? " to" : ""}{" "}
            {email ? <span className="font-bold text-[var(--brand-navy)]">{email}</span> : "to your email address"}.
            Open the link to continue setting up your Lorry Link account.
          </p>
        </div>
        <AppButton href="/login" variant="outline" className="w-full">
          Back to Sign In
        </AppButton>
        <p className="text-xs leading-5 text-[var(--text-secondary)]">
          Didn&apos;t receive it? Check spam, then try signing in again.
        </p>
        <Link href="/" className="block text-sm font-bold text-[var(--brand-blue)]">
          Lorry Link Home
        </Link>
      </div>
    </AuthCard>
  );
}

export function CheckEmailScreen() {
  return (
    <Suspense fallback={<PageLoading />}>
      <CheckEmailContent />
    </Suspense>
  );
}

