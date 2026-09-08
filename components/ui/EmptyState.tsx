import type { LucideIcon } from "lucide-react";
import { PackageOpen } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon: Icon = PackageOpen,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-xl border border-dashed border-[var(--border)] bg-white px-4 py-8 text-center",
        className,
      )}
    >
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-[var(--brand-blue)]">
        <Icon size={23} aria-hidden="true" />
      </span>
      <h2 className="text-base font-bold text-[var(--brand-navy)]">{title}</h2>
      <p className="mt-2 max-w-64 text-sm leading-6 text-[var(--text-secondary)]">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

