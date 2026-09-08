"use client";

import { DriverOnboardingForm } from "@/components/auth/DriverOnboardingForm";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthCard } from "@/components/auth/AuthCard";
import { PageLoading } from "@/components/pages/PageStates";

export function DriverOnboardingScreen() {
  const state = useAuth();

  if (!state.user) {
    return <PageLoading />;
  }

  return (
    <AuthCard title="Complete Driver Profile" subtitle="Add your driver and first lorry details.">
      <DriverOnboardingForm
        userId={state.user.id}
        initialLicense={state.driverProfile?.driving_license_no}
        initialAddress={state.driverProfile?.address}
      />
    </AuthCard>
  );
}

