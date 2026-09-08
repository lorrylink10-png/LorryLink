import { CheckCircle2, IndianRupee, MapPin, Navigation, Package, Ruler, Truck, Weight } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { JobLifecycleActions } from "@/components/driver/JobLifecycleActions";
import { JobStatusTimeline } from "@/components/driver/JobStatusTimeline";
import { AppCard } from "@/components/ui/AppCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  formatCurrency,
  formatDimensions,
  formatPostedTime,
  formatStatus,
  formatWeight,
  getStatusTone,
} from "@/lib/orders/format";
import type { DriverOrderWithLorry } from "@/lib/orders/driver";

type DriverJobDetailProps = {
  job: DriverOrderWithLorry;
  accepted?: boolean;
  pickedUp?: boolean;
  inTransit?: boolean;
  delivered?: boolean;
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-b border-[var(--border)] pb-3 last:border-0 last:pb-0">
      <p className="text-xs font-bold uppercase text-[var(--text-secondary)]">{label}</p>
      <div className="mt-1 break-words text-sm font-semibold leading-6 text-[var(--brand-navy)]">{value}</div>
    </div>
  );
}

function SuccessMessage({
  accepted,
  pickedUp,
  inTransit,
  delivered,
}: Pick<DriverJobDetailProps, "accepted" | "pickedUp" | "inTransit" | "delivered">) {
  const message =
    (accepted && "Pickup accepted successfully.") ||
    (pickedUp && "Item picked up. Live location tracking is now active while Lorry Link is open.") ||
    (inTransit && "Delivery started.") ||
    (delivered && "Delivery completed.");

  if (!message) {
    return null;
  }

  return (
    <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-3 text-sm font-semibold text-[var(--success)]">
      {message}
    </div>
  );
}

export function DriverJobDetail({
  job,
  accepted,
  pickedUp,
  inTransit,
  delivered,
}: DriverJobDetailProps) {
  return (
    <div className="space-y-5">
      <SuccessMessage
        accepted={accepted}
        pickedUp={pickedUp}
        inTransit={inTransit}
        delivered={delivered}
      />

      <AppCard className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase text-[var(--text-secondary)]">Current Status</p>
            <h2 className="mt-1 text-xl font-bold text-[var(--brand-navy)]">{formatStatus(job.status)}</h2>
          </div>
          <StatusBadge tone={getStatusTone(job.status)}>{formatStatus(job.status)}</StatusBadge>
        </div>
        <p className="text-sm font-semibold text-[var(--text-secondary)]">{formatPostedTime(job.created_at)}</p>
      </AppCard>

      <AppCard className="space-y-4">
        <div className="flex items-center gap-2 text-base font-bold text-[var(--brand-navy)]">
          <CheckCircle2 size={18} className="text-[var(--brand-blue)]" aria-hidden="true" />
          Job Timeline
        </div>
        {job.status === "cancelled" ? (
          <p className="rounded-lg bg-red-50 px-3 py-3 text-sm font-bold text-[var(--danger)]">
            Pickup Cancelled
          </p>
        ) : (
          <JobStatusTimeline status={job.status} />
        )}
      </AppCard>

      <AppCard className="space-y-4">
        <div className="flex items-center gap-2 text-base font-bold text-[var(--brand-navy)]">
          <MapPin size={18} className="text-[var(--brand-orange)]" aria-hidden="true" />
          Pickup
        </div>
        <DetailRow label="PIN code" value={job.pickup_pincode} />
        <DetailRow label="Address" value={job.pickup_address} />
        <DetailRow
          label="Exact pickup coordinates"
          value={`${job.pickup_latitude.toFixed(6)}, ${job.pickup_longitude.toFixed(6)}`}
        />
      </AppCard>

      <AppCard className="space-y-4">
        <div className="flex items-center gap-2 text-base font-bold text-[var(--brand-navy)]">
          <MapPin size={18} className="text-[var(--brand-blue)]" aria-hidden="true" />
          Drop
        </div>
        <DetailRow label="PIN code" value={job.drop_pincode} />
        <DetailRow label="Address" value={job.drop_address} />
      </AppCard>

      <AppCard className="space-y-4">
        <div className="flex items-center gap-2 text-base font-bold text-[var(--brand-navy)]">
          <Package size={18} className="text-[var(--brand-blue)]" aria-hidden="true" />
          Parcel
        </div>
        <DetailRow label="Name" value={job.parcel_name} />
        <DetailRow label="Details" value={job.parcel_details || "Not specified"} />
        <DetailRow
          label="Weight"
          value={
            <span className="inline-flex items-center gap-1">
              <Weight size={15} aria-hidden="true" />
              {formatWeight(job.weight_kg)}
            </span>
          }
        />
        <DetailRow
          label="Dimensions"
          value={
            <span className="inline-flex items-center gap-1">
              <Ruler size={15} aria-hidden="true" />
              {formatDimensions(job.length_cm, job.width_cm, job.height_cm)}
            </span>
          }
        />
        <DetailRow
          label="Budget"
          value={
            <span className="inline-flex items-center gap-1">
              <IndianRupee size={15} aria-hidden="true" />
              {formatCurrency(job.budget)}
            </span>
          }
        />
      </AppCard>

      <AppCard className="space-y-4">
        <div className="flex items-center gap-2 text-base font-bold text-[var(--brand-navy)]">
          <Truck size={18} className="text-[var(--brand-blue)]" aria-hidden="true" />
          Assigned Lorry
        </div>
        {job.assignedLorry ? (
          <>
            <DetailRow label="Registration" value={job.assignedLorry.registration_number} />
            <DetailRow label="Vehicle Type" value={job.assignedLorry.vehicle_type} />
            <DetailRow label="Capacity" value={formatWeight(job.assignedLorry.capacity_kg)} />
          </>
        ) : (
          <p className="text-sm leading-6 text-[var(--text-secondary)]">Assigned lorry unavailable.</p>
        )}
      </AppCard>

      {job.status === "picked_up" || job.status === "in_transit" ? (
        <AppCard className="space-y-3 border-orange-200 bg-orange-50">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--brand-orange)]">
            <Navigation size={17} aria-hidden="true" />
            Live tracking active
          </div>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Driver GPS updates continue while Lorry Link is open.
          </p>
          <AppButton href="/driver/tracking" variant="accent" className="w-full">
            View Tracking
          </AppButton>
        </AppCard>
      ) : null}

      <JobLifecycleActions job={job} />
    </div>
  );
}

