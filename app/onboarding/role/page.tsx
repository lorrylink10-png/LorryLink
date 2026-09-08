import { AuthGate } from "@/components/auth/AuthGate";
import { AuthCard } from "@/components/auth/AuthCard";
import { RoleOnboardingForm } from "@/components/auth/RoleOnboardingForm";

export default function RoleOnboardingPage() {
  return (
    <AuthGate mode="role-onboarding">
      <AuthCard title="Welcome to Lorry Link" subtitle="How will you use Lorry Link?">
        <RoleOnboardingForm />
      </AuthCard>
    </AuthGate>
  );
}
