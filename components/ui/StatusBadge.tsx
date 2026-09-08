import { cn } from "@/lib/utils";

export type StatusTone = "neutral" | "active" | "accent" | "danger" | "success";

type StatusBadgeProps = {
  children: React.ReactNode;
  tone?: StatusTone;
  className?: string;
};

const toneClasses: Record<StatusTone, string> = {
  neutral: "bg-slate-100 text-[var(--text-secondary)]",
  active: "bg-blue-50 text-[var(--brand-blue)]",
  accent: "bg-orange-50 text-[var(--brand-orange)]",
  danger: "bg-red-50 text-[var(--danger)]",
  success: "bg-green-50 text-[var(--success)]",
};

export function StatusBadge({ children, tone = "neutral", className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full px-3 text-xs font-bold",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

