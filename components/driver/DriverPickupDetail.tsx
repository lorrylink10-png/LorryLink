import { CheckCircle2, IndianRupee, MapPin, Package, Ruler, Weight } from "lucide-react";
import { AcceptPickupPanel } from "@/components/driver/AcceptPickupPanel";
import { AppCard } from "@/components/ui/AppCard";
import {
  formatCurrency,
  formatDimensions,
  formatPostedTime,
  formatWeight,
} from "@/lib/orders/format";
import type { DriverLorry, DriverOrder } from "@/lib/orders/driver";

type DriverPickupDetailProps = {
  order: DriverOrder;
  lorries: DriverLorry[];
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-b border-[var(--border)] pb-3 last:border-0 last:pb-0">
      <p className="text-xs font-bold uppercase text-[var(--text-secondary)]">{label}</p>
      <div className="mt-1 break-words text-sm font-semibold leading-6 text-[var(--brand-navy)]">{value}</div>
    </div>
  );
}

function formatCreatedTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function DriverPickupDetail({ order, lorries }: DriverPickupDetailProps) {
  return (
    <div className="space-y-5">
      <AppCard className="space-y-3">
        <div className="flex items-center gap-2 text-base font-bold text-[var(--brand-navy)]">
          <Package size={18} className="text-[var(--brand-blue)]" aria-hidden="true" />
          Open Pickup
        </div>
        <p className="text-sm font-semibold text-[var(--text-secondary)]">{formatPostedTime(order.created_at)}</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-[var(--surface-subtle)] p-3">
            <p className="text-xs font-bold uppercase text-[var(--text-secondary)]">Weight</p>
            <p className="mt-1 flex items-center gap-1 text-sm font-bold text-[var(--brand-navy)]">
              <Weight size={15} aria-hidden="true" />
              {formatWeight(order.weight_kg)}
            </p>
          </div>
          <div className="rounded-lg bg-[var(--surface-subtle)] p-3">
            <p className="text-xs font-bold uppercase text-[var(--text-secondary)]">Budget</p>
            <p className="mt-1 flex items-center gap-1 text-sm font-bold text-[var(--brand-navy)]">
              <IndianRupee size={15} aria-hidden="true" />
              {formatCurrency(order.budget)}
            </p>
          </div>
        </div>
      </AppCard>

      <AppCard className="space-y-4">
        <div className="flex items-center gap-2 text-base font-bold text-[var(--brand-navy)]">
          <MapPin size={18} className="text-[var(--brand-orange)]" aria-hidden="true" />
          Pickup
        </div>
        <DetailRow label="PIN code" value={order.pickup_pincode} />
        <DetailRow label="Full address" value={order.pickup_address} />
        <DetailRow
          label="Exact location"
          value={
            <div className="space-y-1">
              <span className="flex items-center gap-2 text-[var(--success)]">
                <CheckCircle2 size={16} aria-hidden="true" />
                Exact pickup location available
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
        <DetailRow label="Full address" value={order.drop_address} />
      </AppCard>

      <AppCard className="space-y-4">
        <div className="flex items-center gap-2 text-base font-bold text-[var(--brand-navy)]">
          <Ruler size={18} className="text-[var(--brand-blue)]" aria-hidden="true" />
          Parcel
        </div>
        <DetailRow label="Name" value={order.parcel_name} />
        <DetailRow label="Details" value={order.parcel_details || "Not specified"} />
        <DetailRow label="Dimensions" value={formatDimensions(order.length_cm, order.width_cm, order.height_cm)} />
        <DetailRow label="Created" value={formatCreatedTime(order.created_at)} />
      </AppCard>

      <AcceptPickupPanel order={order} lorries={lorries} />
    </div>
  );
}

