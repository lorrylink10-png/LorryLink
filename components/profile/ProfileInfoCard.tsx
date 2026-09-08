import { AppCard } from "@/components/ui/AppCard";

type ProfileInfoCardProps = {
  rows: Array<{
    label: string;
    value: string | null | undefined;
  }>;
};

export function ProfileInfoCard({ rows }: ProfileInfoCardProps) {
  return (
    <AppCard className="space-y-4">
      {rows.map((row) => (
        <div key={row.label} className="border-b border-[var(--border)] pb-3 last:border-0 last:pb-0">
          <p className="text-xs font-bold uppercase text-[var(--text-secondary)]">{row.label}</p>
          <p className="mt-1 text-base font-semibold text-[var(--brand-navy)]">{row.value || "Not added"}</p>
        </div>
      ))}
    </AppCard>
  );
}

