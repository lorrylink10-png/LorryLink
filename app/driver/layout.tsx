import { AuthGate } from "@/components/auth/AuthGate";
import { MobileAppShell } from "@/components/layout/MobileAppShell";
import { DriverLocationTracker } from "@/components/tracking/DriverLocationTracker";

export default function DriverLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGate mode="driver">
      <MobileAppShell navType="driver" roleLabel="Driver">
        <DriverLocationTracker>{children}</DriverLocationTracker>
      </MobileAppShell>
    </AuthGate>
  );
}

