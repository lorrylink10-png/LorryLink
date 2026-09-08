"use client";

import { Package, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/domain";

type RoleSelectorProps = {
  value: UserRole | null;
  onChange: (role: UserRole) => void;
};

const roles = [
  {
    value: "customer" as const,
    title: "Send Parcels",
    label: "Customer",
    icon: Package,
  },
  {
    value: "driver" as const,
    title: "Drive & Transport",
    label: "Lorry Driver",
    icon: Truck,
  },
];

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="grid gap-3">
      {roles.map((role) => {
        const Icon = role.icon;
        const selected = value === role.value;

        return (
          <button
            key={role.value}
            type="button"
            onClick={() => onChange(role.value)}
            className={cn(
              "flex min-h-24 items-center gap-4 rounded-xl border bg-white p-4 text-left transition",
              selected
                ? "border-[var(--brand-blue)] bg-blue-50 shadow-[0_10px_24px_rgb(37_99_235_/_12%)]"
                : "border-[var(--border)] hover:border-[var(--brand-blue)]",
            )}
          >
            <span
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                selected ? "bg-[var(--brand-blue)] text-white" : "bg-[var(--surface-subtle)] text-[var(--brand-navy)]",
              )}
            >
              <Icon size={23} aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base font-bold text-[var(--brand-navy)]">{role.title}</span>
              <span className="mt-1 block text-sm font-semibold text-[var(--text-secondary)]">{role.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
