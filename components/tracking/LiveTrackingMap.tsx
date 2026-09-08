"use client";

import dynamic from "next/dynamic";
import { AppCard } from "@/components/ui/AppCard";

type MapPoint = {
  latitude: number;
  longitude: number;
  label: string;
  tone?: "driver" | "pickup";
};

type LiveTrackingMapProps = {
  driverLocation: MapPoint | null;
  pickupLocation?: MapPoint;
};

const LeafletMap = dynamic(() => import("@/components/tracking/LiveTrackingMapInner"), {
  ssr: false,
  loading: () => (
    <AppCard className="flex h-[300px] items-center justify-center text-sm font-semibold text-[var(--text-secondary)]">
      Loading map...
    </AppCard>
  ),
});

export function LiveTrackingMap({ driverLocation, pickupLocation }: LiveTrackingMapProps) {
  if (!driverLocation) {
    return (
      <AppCard className="flex h-[300px] items-center justify-center text-center text-sm font-semibold leading-6 text-[var(--text-secondary)]">
        Waiting for driver&apos;s location...
      </AppCard>
    );
  }

  return <LeafletMap driverLocation={driverLocation} pickupLocation={pickupLocation} />;
}
