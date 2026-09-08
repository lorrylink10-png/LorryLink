import Link from "next/link";
import { ArrowRight, IndianRupee, Truck, Weight } from "lucide-react";
import { AppCard } from "@/components/ui/AppCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  formatCurrency,
  formatStatus,
  formatWeight,
  getStatusTone,
} from "@/lib/orders/format";
import { driverJobHref } from "@/lib/routing";
import type { DriverOrderWithLorry } from "@/lib/orders/driver";

type DriverJobCardProps = {
  job: DriverOrderWithLorry;
};

export function DriverJobCard({ job }: DriverJobCardProps) {
  return (
    <Link href={driverJobHref(job.id)} className="block">
      <AppCard className="space-y-4 transition hover:border-[var(--brand-blue)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-lg font-bold leading-tight text-[var(--brand-navy)]">
              <span className="truncate">{job.pickup_pincode}</span>
              <ArrowRight size={17} className="shrink-0 text-[var(--brand-blue)]" aria-hidden="true" />
              <span className="truncate">{job.drop_pincode}</span>
            </div>
            <p className="mt-1 line-clamp-1 text-sm font-semibold text-[var(--text-secondary)]">
              {job.parcel_name}
            </p>
          </div>
          <StatusBadge tone={getStatusTone(job.status)}>{formatStatus(job.status)}</StatusBadge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-[var(--surface-subtle)] px-3 py-2 text-sm font-bold text-[var(--brand-navy)]">
            <Weight size={16} className="text-[var(--text-secondary)]" aria-hidden="true" />
            {formatWeight(job.weight_kg)}
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-[var(--surface-subtle)] px-3 py-2 text-sm font-bold text-[var(--brand-navy)]">
            <IndianRupee size={16} className="text-[var(--text-secondary)]" aria-hidden="true" />
            {formatCurrency(job.budget)}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
          <Truck size={14} aria-hidden="true" />
          {job.assignedLorry
            ? `${job.assignedLorry.registration_number} - ${job.assignedLorry.vehicle_type}`
            : "Assigned lorry unavailable"}
        </div>
      </AppCard>
    </Link>
  );
}
