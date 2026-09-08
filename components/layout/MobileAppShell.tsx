import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNavigation } from "@/components/layout/BottomNavigation";

type MobileAppShellProps = {
  children: React.ReactNode;
  navType: "customer" | "driver";
  roleLabel: string;
};

export function MobileAppShell({
  children,
  navType,
  roleLabel,
}: MobileAppShellProps) {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-[430px] bg-[var(--background)] shadow-[0_0_60px_rgb(15_39_71_/_10%)]">
      <div className="flex min-h-dvh flex-col">
        <AppHeader roleLabel={roleLabel} />
        <main className="mobile-scroll flex-1 px-4 pb-[calc(96px+env(safe-area-inset-bottom))] pt-4">
          {children}
        </main>
        <BottomNavigation navType={navType} />
      </div>
    </div>
  );
}

