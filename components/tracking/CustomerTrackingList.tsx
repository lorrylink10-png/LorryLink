import { ArrowRight, Truck } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatStatus, getStatusTone } from "@/lib/orders/format";
import { customerOrderTrackingHref } from "@/lib/routing";
import type { TrackableOrderWithLorry } from "@/lib/tracking/types";

type CustomerTrackingListProps = {
  orders: TrackableOrderWithLorry[];
};

export function CustomerTrackingList({ orders }: CustomerTrackingListProps) {
  if (!orders.length) {
    return (
      <EmptyState
        icon={Truck}
        title="No active delivery tracking"
        description="Live tracking becomes available after a driver picks up your parcel."
      />
    );
  }

  return (
    <section className="space-y-3">
      {orders.map((order) => (
        <AppCard key={order.id} className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-lg font-bold leading-tight text-[var(--brand-navy)]">
                <span className="truncate">{order.pickup_pincode}</span>
                <ArrowRight size={17} className="shrink-0 text-[var(--brand-blue)]" aria-hidden="true" />
                <span className="truncate">{order.drop_pincode}</span>
              </div>
              <p className="mt-1 line-clamp-1 text-sm font-semibold text-[var(--text-secondary)]">
                {order.assignedLorry
                  ? order.assignedLorry.registration_number
                  : order.parcel_name}
              </p>
            </div>
            <StatusBadge tone={getStatusTone(order.status)}>{formatStatus(order.status)}</StatusBadge>
          </div>
          <AppButton href={customerOrderTrackingHref(order.id)} className="w-full">
            Track
          </AppButton>
        </AppCard>
      ))}
    </section>
  );
}

