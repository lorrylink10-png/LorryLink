import { CheckCircle2, Map, MapPin, Package, Truck } from "lucide-react";
import { CancelPickupButton } from "@/components/customer/CancelPickupButton";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  formatCurrency,
  formatDimensions,
  formatLorryDimensions,
  formatPostedTime,
  formatStatus,
  formatWeight,
  getStatusTone,
} from "@/lib/orders/format";
import { customerOrderTrackingHref } from "@/lib/routing";
import type { CustomerAssignedLorry, CustomerOrder } from "@/lib/orders/customer";

type OrderDetailProps = {
  order: CustomerOrder;
  assignedLorry?: CustomerAssignedLorry | null;
  created?: boolean;
  cancelled?: boolean;
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-b border-[var(--border)] pb-3 last:border-0 last:pb-0">
      <p className="text-xs font-bold uppercase text-[var(--text-secondary)]">{label}</p>
      <div className="mt-1 text-sm font-semibold leading-6 text-[var(--brand-navy)]">{value}</div>
    </div>
  );
}

export function OrderDetail({ order, assignedLorry, created, cancelled }: OrderDetailProps) {
  const waiting = order.status === "open";
  const assigned = Boolean(order.assigned_driver_id && order.assigned_lorry_id);

  return (
    <div className="space-y-5">
      {created ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-3 text-sm font-semibold text-[var(--success)]">
          Pickup created successfully.
        </div>
      ) : null}
      {cancelled ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm font-semibold text-[var(--danger)]">
          Pickup cancelled.
        </div>
      ) : null}

      <AppCard className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase text-[var(--text-secondary)]">Status</p>
            <h2 className="mt-1 text-xl font-bold text-[var(--brand-navy)]">{formatStatus(order.status)}</h2>
          </div>
          <StatusBadge tone={getStatusTone(order.status)}>{formatStatus(order.status)}</StatusBadge>
        </div>
        <p className="text-sm font-semibold text-[var(--text-secondary)]">{formatPostedTime(order.created_at)}</p>
      </AppCard>

      <AppCard className="space-y-4">
        <div className="flex items-center gap-2 text-base font-bold text-[var(--brand-navy)]">
          <MapPin size={18} className="text-[var(--brand-orange)]" aria-hidden="true" />
          Pickup
        </div>
        <DetailRow label="PIN code" value={order.pickup_pincode} />
        <DetailRow label="Address" value={order.pickup_address} />
        <DetailRow
          label="Exact location"
          value={
            <div className="space-y-1">
              <span className="flex items-center gap-2 text-[var(--success)]">
                <CheckCircle2 size={16} aria-hidden="true" />
                Pickup location saved
              </span>
              <p className="text-xs text-[var(--text-secondary)]">
                {order.pickup_latitude.toFixed(6)}, {order.pickup_longitude.toFixed(6)}
              </p>
            </div>
          }
        />
      </AppCard>

      <AppCard className="space-y-4">
        <div className="flex items-center gap-2 text-base font-bold text-[var(--brand-navy)]">
          <MapPin size={18} className="text-[var(--brand-blue)]" aria-hidden="true" />
          Drop
        </div>
        <DetailRow label="PIN code" value={order.drop_pincode} />
        <DetailRow label="Address" value={order.drop_address} />
      </AppCard>

      <AppCard className="space-y-4">
        <div className="flex items-center gap-2 text-base font-bold text-[var(--brand-navy)]">
          <Package size={18} className="text-[var(--brand-blue)]" aria-hidden="true" />
          Parcel
        </div>
        <DetailRow label="Name" value={order.parcel_name} />
        <DetailRow label="Details" value={order.parcel_details || "Not specified"} />
        <DetailRow label="Weight" value={formatWeight(order.weight_kg)} />
        <DetailRow label="Dimensions" value={formatDimensions(order.length_cm, order.width_cm, order.height_cm)} />
        <DetailRow label="Budget" value={formatCurrency(order.budget)} />
        <DetailRow
          label="Created"
          value={new Intl.DateTimeFormat("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(order.created_at))}
        />
      </AppCard>

      <AppCard className="space-y-2">
        <div className="flex items-center gap-2 text-base font-bold text-[var(--brand-navy)]">
          <Truck size={18} className="text-[var(--brand-blue)]" aria-hidden="true" />
          Driver
        </div>
        {waiting ? (
          <>
            <h2 className="font-bold text-[var(--brand-navy)]">Waiting for a driver</h2>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              Your pickup is visible to available lorry drivers.
            </p>
          </>
        ) : assigned ? (
          <>
            <h2 className="font-bold text-[var(--brand-navy)]">Driver assigned</h2>
            {assignedLorry ? (
              <div className="space-y-3 pt-1">
                <DetailRow label="Lorry Registration" value={assignedLorry.registration_number} />
                <DetailRow label="Vehicle Type" value={assignedLorry.vehicle_type} />
                <DetailRow label="Capacity" value={formatWeight(assignedLorry.capacity_kg)} />
                <DetailRow label="Deck Size" value={formatLorryDimensions(assignedLorry.length_ft, assignedLorry.width_ft)} />
              </div>
            ) : (
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                Assigned lorry details are not available yet.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm leading-6 text-[var(--text-secondary)]">No driver details available.</p>
        )}
      </AppCard>

      {order.status === "picked_up" || order.status === "in_transit" ? (
        <AppButton href={customerOrderTrackingHref(order.id)} className="w-full">
          <Map size={18} aria-hidden="true" />
          Track Lorry
        </AppButton>
      ) : null}

      <CancelPickupButton orderId={order.id} status={order.status} />
    </div>
  );
}

