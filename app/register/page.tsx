import { AuthGate } from "@/components/auth/AuthGate";
import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthGate mode="public">
      <AuthCard title="Create Account" subtitle="Start with your Lorry Link role.">
        <RegisterForm />
      </AuthCard>
    </AuthGate>
  );
}

