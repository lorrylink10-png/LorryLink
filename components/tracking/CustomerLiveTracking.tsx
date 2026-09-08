"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, RefreshCw, Truck } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LiveTrackingMap } from "@/components/tracking/LiveTrackingMap";
import { formatStatus, getStatusTone } from "@/lib/orders/format";
import { formatAccuracy, formatLastUpdated, getLocationDelayState } from "@/lib/tracking/format";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { DriverLocationRow, TrackableOrderWithLorry } from "@/lib/tracking/types";
import type { PickupStatus } from "@/types/domain";

type CustomerLiveTrackingProps = {
  order: TrackableOrderWithLorry;
  initialLocation: DriverLocationRow | null;
};

type ConnectionState = "connecting" | "connected" | "reconnecting";

export function CustomerLiveTracking({
  order,
  initialLocation,
}: CustomerLiveTrackingProps) {
  const [location, setLocation] = useState<DriverLocationRow | null>(initialLocation);
  const [status, setStatus] = useState<PickupStatus>(order.status);
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");
  const [refreshToken, setRefreshToken] = useState(0);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const locationDelay = getLocationDelayState(location?.recorded_at);
  const terminal = status === "delivered" || status === "cancelled";

  const refreshOrderStatus = useCallback(async () => {
    const { data } = await supabase
      .from("pickup_orders")
      .select("status")
      .eq("id", order.id)
      .maybeSingle();

    if (data?.status) {
      setStatus(data.status);
    }
  }, [order.id, supabase]);

  useEffect(() => {
    const channel = supabase
      .channel(`driver-location-${order.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "driver_locations",
          filter: `order_id=eq.${order.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            setLocation(payload.new as DriverLocationRow);
          }

          if (payload.eventType === "DELETE") {
            void refreshOrderStatus();
          }
        },
      )
      .subscribe((subscriptionStatus) => {
        if (subscriptionStatus === "SUBSCRIBED") {
          setConnectionState("connected");
        }

        if (subscriptionStatus === "CHANNEL_ERROR" || subscriptionStatus === "TIMED_OUT") {
          setConnectionState("reconnecting");
        }
      });

    const statusTimer = window.setInterval(() => {
      void refreshOrderStatus();
    }, 60 * 1000);

    return () => {
      window.clearInterval(statusTimer);
      void supabase.removeChannel(channel);
    };
  }, [order.id, refreshOrderStatus, refreshToken, supabase]);

  async function handleRefresh() {
    setConnectionState("connecting");
    const [{ data: nextLocation }, { data: orderStatus }] = await Promise.all([
      supabase.from("driver_locations").select("*").eq("order_id", order.id).maybeSingle(),
      supabase.from("pickup_orders").select("status").eq("id", order.id).maybeSingle(),
    ]);

    if (nextLocation) {
      setLocation(nextLocation);
    }

    if (orderStatus?.status) {
      setStatus(orderStatus.status);
    }

    setRefreshToken((token) => token + 1);
  }

  return (
    <div className="space-y-5">
      <AppCard className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase text-[var(--brand-orange)]">Live Delivery</p>
            <h2 className="mt-1 truncate text-xl font-bold text-[var(--brand-navy)]">
              {order.pickup_pincode}
            </h2>
            <ArrowDown size={17} className="my-1 text-[var(--brand-blue)]" aria-hidden="true" />
            <h3 className="truncate text-xl font-bold text-[var(--brand-navy)]">
              {order.drop_pincode}
            </h3>
          </div>
          <StatusBadge tone={getStatusTone(status)}>{formatStatus(status)}</StatusBadge>
        </div>

        {terminal ? (
          <div className="rounded-lg bg-green-50 px-3 py-3 text-sm font-bold text-[var(--success)]">
            {status === "delivered" ? "Delivery Completed" : "Pickup Cancelled"}
          </div>
        ) : (
          <div className="rounded-lg bg-orange-50 px-3 py-3 text-sm font-bold text-[var(--brand-orange)]">
            Lorry is on the move
          </div>
        )}
      </AppCard>

      <LiveTrackingMap
        driverLocation={
          location
            ? {
                latitude: location.latitude,
                longitude: location.longitude,
                label: "Current lorry location",
                tone: "driver",
              }
            : null
        }
        pickupLocation={{
          latitude: order.pickup_latitude,
          longitude: order.pickup_longitude,
          label: "Pickup location",
          tone: "pickup",
        }}
      />

      {!location ? (
        <AppCard className="space-y-2">
        <h2 className="text-base font-bold text-[var(--brand-navy)]">Waiting for driver&apos;s location...</h2>
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Live tracking will appear as soon as the driver&apos;s phone sends its first GPS update.
        </p>
        </AppCard>
      ) : (
        <AppCard className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-[var(--surface-subtle)] p-3">
              <p className="text-xs font-bold uppercase text-[var(--text-secondary)]">Last updated</p>
              <p className="mt-1 text-sm font-bold text-[var(--brand-navy)]">
                {formatLastUpdated(location.recorded_at)}
              </p>
            </div>
            <div className="rounded-lg bg-[var(--surface-subtle)] p-3">
              <p className="text-xs font-bold uppercase text-[var(--text-secondary)]">Accuracy</p>
              <p className="mt-1 text-sm font-bold text-[var(--brand-navy)]">
                {formatAccuracy(location.accuracy)}
              </p>
            </div>
          </div>

          {locationDelay === "delayed" ? (
            <p className="rounded-lg bg-orange-50 px-3 py-3 text-sm font-semibold text-[var(--brand-orange)]">
              Location update delayed.
            </p>
          ) : null}
          {locationDelay === "old" ? (
            <p className="rounded-lg bg-red-50 px-3 py-3 text-sm font-semibold text-[var(--danger)]">
              Driver location has not updated recently.
            </p>
          ) : null}

          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)]">
            <Truck size={16} aria-hidden="true" />
            {order.assignedLorry
              ? `${order.assignedLorry.registration_number} - ${order.assignedLorry.vehicle_type}`
              : "Assigned lorry"}
          </div>
        </AppCard>
      )}

      <AppCard className="space-y-3">
        <p className="text-sm font-semibold text-[var(--text-secondary)]">
          Realtime: {connectionState === "connected" ? "Connected" : "Reconnecting..."}
        </p>
        <AppButton type="button" variant="outline" className="w-full" onClick={handleRefresh}>
          <RefreshCw size={17} aria-hidden="true" />
          Refresh
        </AppButton>
      </AppCard>
    </div>
  );
}

