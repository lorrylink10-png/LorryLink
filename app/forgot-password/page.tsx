import { AuthCard } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthCard title="Reset password" subtitle="Enter your email to receive reset instructions.">
      <ForgotPasswordForm />
    </AuthCard>
  );
}
