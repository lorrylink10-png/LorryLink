"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppButton } from "@/components/ui/AppButton";
import { useAuth } from "@/components/auth/AuthProvider";

type AuthGateProps = {
  children: React.ReactNode;
  mode: "public" | "customer" | "driver" | "role-onboarding" | "driver-onboarding" | "password-update";
};

function StartupScreen({ offline, onRetry }: { offline: boolean; onRetry: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col items-center justify-center bg-[var(--background)] px-6 text-center shadow-[0_0_60px_rgb(15_39_71_/_10%)]">
      <Image
        src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logo.png`}
        alt="Lorry Link"
        width={150}
        height={60}
        priority
        className="mx-auto w-40"
      />
      {offline ? (
        <>
          <h1 className="mt-8 text-xl font-bold text-[var(--brand-navy)]">You&apos;re offline</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            Lorry Link needs an internet connection to load your account and delivery information.
          </p>
          <AppButton type="button" className="mt-6 w-full" onClick={onRetry}>
            Try Again
          </AppButton>
        </>
      ) : (
        <p className="mt-8 text-sm font-bold text-[var(--text-secondary)]">Loading...</p>
      )}
    </main>
  );
}

export function AuthGate({ children, mode }: AuthGateProps) {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (auth.loading || auth.offline) {
      return;
    }

    if (mode === "public") {
      if (auth.user) {
        router.replace(auth.destination);
      }
      return;
    }

    if (!auth.user) {
      router.replace("/login");
      return;
    }

    if (mode === "role-onboarding") {
      if (auth.profile?.role) {
        router.replace(auth.destination);
      }
      return;
    }

    if (mode === "driver-onboarding") {
      if (auth.profile?.role !== "driver") {
        router.replace(auth.destination);
        return;
      }

      if (auth.isDriverOnboardingComplete) {
        router.replace("/driver/discover");
      }
      return;
    }

    if (mode === "password-update") {
      return;
    }

    if (mode === "customer" && auth.profile?.role !== "customer") {
      router.replace(auth.destination);
      return;
    }

    if (mode === "driver") {
      if (auth.profile?.role !== "driver" || !auth.isDriverOnboardingComplete) {
        router.replace(auth.destination);
      }
    }
  }, [auth, mode, pathname, router]);

  if (auth.loading || auth.offline) {
    return <StartupScreen offline={auth.offline} onRetry={() => void auth.refreshAuth()} />;
  }

  if (mode === "public") {
    return auth.user ? <StartupScreen offline={false} onRetry={() => void auth.refreshAuth()} /> : children;
  }

  if (!auth.user) {
    return <StartupScreen offline={false} onRetry={() => void auth.refreshAuth()} />;
  }

  if (mode === "role-onboarding") {
    return auth.profile?.role ? <StartupScreen offline={false} onRetry={() => void auth.refreshAuth()} /> : children;
  }

  if (mode === "driver-onboarding") {
    const allowed = auth.profile?.role === "driver" && !auth.isDriverOnboardingComplete;
    return allowed ? children : <StartupScreen offline={false} onRetry={() => void auth.refreshAuth()} />;
  }

  if (mode === "password-update") {
    return children;
  }

  if (mode === "customer") {
    return auth.profile?.role === "customer"
      ? children
      : <StartupScreen offline={false} onRetry={() => void auth.refreshAuth()} />;
  }

  const allowed = auth.profile?.role === "driver" && auth.isDriverOnboardingComplete;
  return allowed ? children : <StartupScreen offline={false} onRetry={() => void auth.refreshAuth()} />;
}

