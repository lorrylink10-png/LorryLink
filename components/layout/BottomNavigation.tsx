"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { customerNavItems, driverNavItems } from "@/lib/navigation";

type BottomNavigationProps = {
  navType: "customer" | "driver";
};

export function BottomNavigation({ navType }: BottomNavigationProps) {
  const pathname = usePathname();
  const items = navType === "customer" ? customerNavItems : driverNavItems;

  return (
    <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 border-t border-[var(--border)] bg-white px-2 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 shadow-[0_-12px_28px_rgb(15_39_71_/_8%)]">
      <div
        className={cn(
          "grid items-end gap-1",
          items.length === 5 ? "grid-cols-5" : "grid-cols-4",
        )}
      >
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href === "/customer/orders" && pathname === "/customer/order") ||
            (item.href === "/customer/tracking" && pathname === "/customer/tracking/live") ||
            (item.href === "/driver/discover" && pathname === "/driver/discover/details") ||
            (item.href === "/driver/jobs" && pathname === "/driver/job") ||
            (item.href === "/driver/ads/create" && pathname.startsWith("/driver/ads"));

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "touch-target flex flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-[11px] font-semibold transition",
                isActive
                  ? "text-[var(--brand-blue)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--brand-navy)]",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full transition",
                  item.prominent && "bg-[var(--brand-blue)] text-white shadow-[0_8px_18px_rgb(37_99_235_/_28%)]",
                  isActive && !item.prominent && "bg-blue-50",
                )}
              >
                <Icon size={item.prominent ? 19 : 18} strokeWidth={2.3} aria-hidden="true" />
              </span>
              <span className="leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

