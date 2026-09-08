import { AuthGate } from "@/components/auth/AuthGate";
import { AuthCard } from "@/components/auth/AuthCard";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";

export default function UpdatePasswordPage() {
  return (
    <AuthGate mode="password-update">
      <AuthCard title="Update password" subtitle="Choose a new password for your account.">
        <UpdatePasswordForm />
      </AuthCard>
    </AuthGate>
  );
}
