import { cn } from "@/lib/utils";

type AppCardProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

export function AppCard({ children, className, ...props }: AppCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
