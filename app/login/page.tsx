import { AuthGate } from "@/components/auth/AuthGate";
import { LoginScreen } from "@/components/auth/LoginScreen";

export default function LoginPage() {
  return (
    <AuthGate mode="public">
      <LoginScreen />
    </AuthGate>
  );
}
