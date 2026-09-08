import Link from "next/link";
import { ArrowRight, CalendarClock, IndianRupee, MapPin, Weight } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import {
  formatCurrency,
  formatPostedTime,
  formatWeight,
} from "@/lib/orders/format";
import { driverDiscoverDetailHref } from "@/lib/routing";
import type { DriverOrder } from "@/lib/orders/driver";

type PickupCardProps = {
  order: DriverOrder;
};

function compactAddress(address: string) {
  return address.split(",")[0]?.trim() || address;
}

export function PickupCard({ order }: PickupCardProps) {
  return (
    <AppCard className="space-y-4 transition hover:border-[var(--brand-blue)]">
      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-lg font-bold leading-tight text-[var(--brand-navy)]">
          <span className="max-w-[8rem] truncate">{compactAddress(order.pickup_address)}</span>
          <ArrowRight size={17} className="shrink-0 text-[var(--brand-blue)]" aria-hidden="true" />
          <span className="max-w-[8rem] truncate">{compactAddress(order.drop_address)}</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)]">
          <MapPin size={15} className="shrink-0 text-[var(--brand-orange)]" aria-hidden="true" />
          <span className="truncate">
            {order.pickup_pincode} -&gt; {order.drop_pincode}
          </span>
        </div>
      </div>

      <div>
        <p className="line-clamp-1 text-sm font-bold text-[var(--brand-navy)]">{order.parcel_name}</p>
        {order.parcel_details ? (
          <p className="mt-1 line-clamp-1 text-xs font-semibold text-[var(--text-secondary)]">
            {order.parcel_details}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-[var(--surface-subtle)] px-3 py-2 text-sm font-bold text-[var(--brand-navy)]">
          <Weight size={16} className="shrink-0 text-[var(--text-secondary)]" aria-hidden="true" />
          <span className="truncate">{formatWeight(order.weight_kg)}</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-[var(--surface-subtle)] px-3 py-2 text-sm font-bold text-[var(--brand-navy)]">
          <IndianRupee size={16} className="shrink-0 text-[var(--text-secondary)]" aria-hidden="true" />
          <span className="truncate">{formatCurrency(order.budget)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
        <CalendarClock size={14} aria-hidden="true" />
        {formatPostedTime(order.created_at)}
      </div>

      <AppButton href={driverDiscoverDetailHref(order.id)} variant="outline" className="w-full">
        View Details
      </AppButton>
    </AppCard>
  );
}

