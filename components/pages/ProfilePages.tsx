"use client";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { useAuth } from "@/components/auth/AuthProvider";
import { ProfileInfoCard } from "@/components/profile/ProfileInfoCard";
import { PageHeader } from "@/components/ui/PageHeader";

export function CustomerProfileScreen() {
  const state = useAuth();
  const profile = state.profile;

  return (
    <div className="space-y-5">
      <PageHeader title="Profile" description="Your Lorry Link customer account." />
      <ProfileInfoCard
        rows={[
          { label: "Full Name", value: profile?.full_name },
          { label: "Email", value: profile?.email ?? state.user?.email },
          { label: "Phone", value: profile?.phone },
          { label: "Account Type", value: "Customer" },
        ]}
      />
      <LogoutButton />
    </div>
  );
}

export function DriverProfileScreen() {
  const state = useAuth();
  const profile = state.profile;
  const lorry = state.firstLorry;

  return (
    <div className="space-y-5">
      <PageHeader title="Profile" description="Your Lorry Link driver account." />
      <ProfileInfoCard
        rows={[
          { label: "Full Name", value: profile?.full_name },
          { label: "Email", value: profile?.email ?? state.user?.email },
          { label: "Phone", value: profile?.phone },
          { label: "Account Type", value: "Lorry Driver" },
          { label: "Driving Licence", value: state.driverProfile?.driving_license_no },
          { label: "Lorry", value: lorry ? `${lorry.registration_number} - ${lorry.vehicle_type}` : null },
        ]}
      />
      <LogoutButton />
    </div>
  );
}
