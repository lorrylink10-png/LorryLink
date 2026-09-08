"use client";

import { ArrowDown, Navigation, RefreshCw, Truck } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LiveTrackingMap } from "@/components/tracking/LiveTrackingMap";
import { useDriverTracking } from "@/components/tracking/DriverLocationTracker";
import { formatAccuracy, formatLastUpdated } from "@/lib/tracking/format";
import type { DriverLocationRow } from "@/lib/tracking/types";

type DriverTrackingExperienceProps = {
  initialLocation: DriverLocationRow | null;
};

function locationFromRow(location: DriverLocationRow | null) {
  if (!location) {
    return null;
  }

  return {
    latitude: location.latitude,
    longitude: location.longitude,
    accuracy: location.accuracy,
    heading: location.heading,
    speed: location.speed,
    recordedAt: location.recorded_at,
  };
}

export function DriverTrackingExperience({
  initialLocation,
}: DriverTrackingExperienceProps) {
  const {
    activeOrders,
    activeOrder,
    latestLocation,
    lastSentAt,
    trackingState,
    gpsMessage,
    uploadMessage,
    isOnline,
    selectOrder,
    retry,
  } = useDriverTracking();

  if (!activeOrders.length) {
    return (
      <EmptyState
        icon={Navigation}
        title="No delivery is currently being tracked"
        description="Tracking starts after you confirm that an item has been picked up."
      />
    );
  }

  if (trackingState === "multiple_active") {
    return (
      <div className="space-y-4">
        <AppCard className="space-y-2">
          <h2 className="text-base font-bold text-[var(--brand-navy)]">Choose tracking job</h2>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Select which active delivery this device is currently carrying.
          </p>
        </AppCard>
        {activeOrders.map((order) => (
          <AppCard key={order.id} className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-[var(--brand-navy)]">
                  {order.pickup_pincode} to {order.drop_pincode}
                </p>
                <p className="text-sm font-semibold text-[var(--text-secondary)]">{order.parcel_name}</p>
              </div>
              <StatusBadge tone="accent">Active</StatusBadge>
            </div>
            <AppButton type="button" className="w-full" onClick={() => selectOrder(order.id)}>
              Track This Job
            </AppButton>
          </AppCard>
        ))}
      </div>
    );
  }

  if (!activeOrder) {
    return null;
  }

  const displayLocation = latestLocation ?? locationFromRow(initialLocation);
  const sentAt = lastSentAt ?? displayLocation?.recordedAt ?? null;

  return (
    <div className="space-y-5">
      <AppCard className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase text-[var(--brand-orange)]">Live Tracking</p>
            <h2 className="mt-1 truncate text-xl font-bold text-[var(--brand-navy)]">
              {activeOrder.pickup_pincode}
            </h2>
            <ArrowDown size={17} className="my-1 text-[var(--brand-blue)]" aria-hidden="true" />
            <h3 className="truncate text-xl font-bold text-[var(--brand-navy)]">
              {activeOrder.drop_pincode}
            </h3>
          </div>
          <StatusBadge tone={trackingState === "active" ? "accent" : "danger"}>
            {trackingState === "active" ? "Live" : "Issue"}
          </StatusBadge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-[var(--surface-subtle)] p-3">
            <p className="text-xs font-bold uppercase text-[var(--text-secondary)]">Last sent</p>
            <p className="mt-1 text-sm font-bold text-[var(--brand-navy)]">{formatLastUpdated(sentAt)}</p>
          </div>
          <div className="rounded-lg bg-[var(--surface-subtle)] p-3">
            <p className="text-xs font-bold uppercase text-[var(--text-secondary)]">Accuracy</p>
            <p className="mt-1 text-sm font-bold text-[var(--brand-navy)]">
              {formatAccuracy(displayLocation?.accuracy)}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-orange-50 px-3 py-3 text-sm font-semibold text-[var(--brand-orange)]">
          Keep Lorry Link open during delivery for continuous web tracking.
        </div>
      </AppCard>

      <LiveTrackingMap
        driverLocation={
          displayLocation
            ? {
                latitude: displayLocation.latitude,
                longitude: displayLocation.longitude,
                label: "Current lorry location",
                tone: "driver",
              }
            : null
        }
        pickupLocation={{
          latitude: activeOrder.pickup_latitude,
          longitude: activeOrder.pickup_longitude,
          label: "Pickup location",
          tone: "pickup",
        }}
      />

      <AppCard className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-[var(--brand-navy)]">
          <Truck size={17} className="text-[var(--brand-orange)]" aria-hidden="true" />
          {gpsMessage ? "Location unavailable" : "Live location active"}
        </div>
        {gpsMessage ? (
          <p className="text-sm leading-6 text-[var(--text-secondary)]">{gpsMessage}</p>
        ) : null}
        {uploadMessage ? (
          <p className="text-sm leading-6 text-[var(--brand-orange)]">{uploadMessage}</p>
        ) : null}
        <p className="text-sm font-semibold text-[var(--text-secondary)]">
          Internet: {isOnline ? "Connected" : "Offline"}
        </p>
        {gpsMessage ? (
          <AppButton type="button" variant="outline" className="w-full" onClick={retry}>
            <RefreshCw size={17} aria-hidden="true" />
            Try Again
          </AppButton>
        ) : null}
      </AppCard>
    </div>
  );
}

