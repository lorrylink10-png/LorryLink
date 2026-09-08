"use client";

import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";

type MapPoint = {
  latitude: number;
  longitude: number;
  label: string;
  tone?: "driver" | "pickup";
};

type LiveTrackingMapInnerProps = {
  driverLocation: MapPoint;
  pickupLocation?: MapPoint;
};

function makeIcon(tone: "driver" | "pickup") {
  const color = tone === "pickup" ? "#F97316" : "#2563EB";
  const label = tone === "pickup" ? "P" : "L";

  return L.divIcon({
    className: "",
    html: `<span style="display:flex;height:34px;width:34px;align-items:center;justify-content:center;border-radius:999px;border:3px solid #fff;background:${color};color:#fff;font:700 13px system-ui;box-shadow:0 10px 22px rgb(15 39 71 / 22%);">${label}</span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -16],
  });
}

function MapController({
  location,
  interactedRef,
}: {
  location: MapPoint;
  interactedRef: React.MutableRefObject<boolean>;
}) {
  const map = useMap();

  useMapEvents({
    dragstart: () => {
      interactedRef.current = true;
    },
    zoomstart: () => {
      interactedRef.current = true;
    },
  });

  useEffect(() => {
    if (!interactedRef.current) {
      map.setView([location.latitude, location.longitude], map.getZoom(), {
        animate: true,
      });
    }
  }, [interactedRef, location.latitude, location.longitude, map]);

  return null;
}

export default function LiveTrackingMapInner({
  driverLocation,
  pickupLocation,
}: LiveTrackingMapInnerProps) {
  const interactedRef = useRef(false);
  const driverIcon = useMemo(() => makeIcon("driver"), []);
  const pickupIcon = useMemo(() => makeIcon("pickup"), []);

  return (
    <div className="relative h-[300px] overflow-hidden rounded-xl border border-[var(--border)]">
      <MapContainer
        center={[driverLocation.latitude, driverLocation.longitude]}
        zoom={15}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController location={driverLocation} interactedRef={interactedRef} />
        {pickupLocation ? (
          <Marker
            position={[pickupLocation.latitude, pickupLocation.longitude]}
            icon={pickupIcon}
          >
            <Popup>{pickupLocation.label}</Popup>
          </Marker>
        ) : null}
        <Marker
          position={[driverLocation.latitude, driverLocation.longitude]}
          icon={driverIcon}
        >
          <Popup>{driverLocation.label}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
