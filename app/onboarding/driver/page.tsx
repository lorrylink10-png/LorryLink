import { AuthGate } from "@/components/auth/AuthGate";
import { DriverOnboardingScreen } from "@/components/auth/DriverOnboardingScreen";

export default function DriverOnboardingPage() {
  return (
    <AuthGate mode="driver-onboarding">
      <DriverOnboardingScreen />
    </AuthGate>
  );
}
