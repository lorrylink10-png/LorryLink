import { AuthGate } from "@/components/auth/AuthGate";
import { MobileAppShell } from "@/components/layout/MobileAppShell";

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGate mode="customer">
      <MobileAppShell navType="customer" roleLabel="Customer">
        {children}
      </MobileAppShell>
    </AuthGate>
  );
}
