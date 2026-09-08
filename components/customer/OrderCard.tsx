import Link from "next/link";
import { ArrowRight, CalendarClock, IndianRupee, Weight } from "lucide-react";
import { AppCard } from "@/components/ui/AppCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  formatCurrency,
  formatPostedTime,
  formatStatus,
  formatWeight,
  getStatusTone,
} from "@/lib/orders/format";
import { customerOrderHref } from "@/lib/routing";
import type { CustomerOrder } from "@/lib/orders/customer";

type OrderCardProps = {
  order: CustomerOrder;
};

export function OrderCard({ order }: OrderCardProps) {
  return (
    <Link href={customerOrderHref(order.id)} className="block">
      <AppCard className="space-y-4 transition hover:border-[var(--brand-blue)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-lg font-bold leading-tight text-[var(--brand-navy)]">
              <span className="truncate">{order.pickup_pincode}</span>
              <ArrowRight size={17} className="shrink-0 text-[var(--brand-blue)]" aria-hidden="true" />
              <span className="truncate">{order.drop_pincode}</span>
            </div>
            <p className="mt-1 line-clamp-1 text-sm font-semibold text-[var(--text-secondary)]">
              {order.parcel_name}
            </p>
          </div>
          <StatusBadge tone={getStatusTone(order.status)}>{formatStatus(order.status)}</StatusBadge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-[var(--surface-subtle)] px-3 py-2 text-sm font-bold text-[var(--brand-navy)]">
            <Weight size={16} className="text-[var(--text-secondary)]" aria-hidden="true" />
            {formatWeight(order.weight_kg)}
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-[var(--surface-subtle)] px-3 py-2 text-sm font-bold text-[var(--brand-navy)]">
            <IndianRupee size={16} className="text-[var(--text-secondary)]" aria-hidden="true" />
            {formatCurrency(order.budget)}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
          <CalendarClock size={14} aria-hidden="true" />
          {formatPostedTime(order.created_at)}
        </div>
      </AppCard>
    </Link>
  );
}

