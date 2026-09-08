"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { locationUploadErrorMessage, updateDriverLocation } from "@/lib/tracking/client";
import type { LocationPayload, TrackableOrder } from "@/lib/tracking/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getDriverTrackableOrders } from "@/lib/tracking/queries";
import { useAuth } from "@/components/auth/AuthProvider";

type TrackingState = "idle" | "active" | "location_unavailable" | "permission_denied" | "multiple_active";

type DriverTrackingContextValue = {
  activeOrders: TrackableOrder[];
  activeOrder: TrackableOrder | null;
  selectedOrderId: string | null;
  latestLocation: LocationPayload | null;
  lastSentAt: string | null;
  trackingState: TrackingState;
  gpsMessage: string | null;
  uploadMessage: string | null;
  isOnline: boolean;
  selectOrder: (orderId: string) => void;
  retry: () => void;
};

type DriverLocationTrackerProps = {
  children: React.ReactNode;
};

const UPLOAD_INTERVAL_MS = 60 * 1000;
const MAX_POSITION_AGE_MS = 2 * 60 * 1000;

const DriverTrackingContext = createContext<DriverTrackingContextValue | null>(null);

function gpsErrorMessage(error: GeolocationPositionError) {
  if (error.code === error.PERMISSION_DENIED) {
    return "Location permission is required for live delivery tracking. Allow location access for Lorry Link in your browser settings, then try again.";
  }

  return "Unable to get your current location. Make sure GPS/location services are enabled and try again.";
}

function positionToPayload(position: GeolocationPosition): LocationPayload | null {
  if (Date.now() - position.timestamp > MAX_POSITION_AGE_MS) {
    return null;
  }

  const { coords } = position;

  if (
    !Number.isFinite(coords.latitude) ||
    coords.latitude < -90 ||
    coords.latitude > 90 ||
    !Number.isFinite(coords.longitude) ||
    coords.longitude < -180 ||
    coords.longitude > 180
  ) {
    return null;
  }

  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: Number.isFinite(coords.accuracy) ? coords.accuracy : null,
    heading: typeof coords.heading === "number" && Number.isFinite(coords.heading) ? coords.heading : null,
    speed: typeof coords.speed === "number" && Number.isFinite(coords.speed) ? coords.speed : null,
    recordedAt: new Date(position.timestamp).toISOString(),
  };
}

export function DriverLocationTracker({
  children,
}: DriverLocationTrackerProps) {
  const auth = useAuth();
  const [activeOrders, setActiveOrders] = useState<TrackableOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem("lorry-link-tracking-order");
  });
  const activeOrder =
    activeOrders.length === 1
      ? activeOrders[0]
      : activeOrders.find((order) => order.id === selectedOrderId) ?? null;
  const [latestLocation, setLatestLocation] = useState<LocationPayload | null>(null);
  const [lastSentAt, setLastSentAt] = useState<string | null>(null);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator === "undefined") {
      return true;
    }

    return navigator.onLine;
  });
  const [retryToken, setRetryToken] = useState(0);
  const [ordersRefreshToken, setOrdersRefreshToken] = useState(0);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const latestLocationRef = useRef<LocationPayload | null>(null);
  const lastUploadMsRef = useRef(0);
  const uploadInFlightRef = useRef(false);
  const stoppedRef = useRef(false);

  const cleanupTracking = useCallback(() => {
    stoppedRef.current = true;

    if (watchIdRef.current !== null && "geolocation" in navigator) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    uploadInFlightRef.current = false;
  }, []);

  const uploadLatest = useCallback(async (orderId: string, immediate = false) => {
    const current = latestLocationRef.current;

    if (!current || stoppedRef.current || uploadInFlightRef.current || !navigator.onLine) {
      return;
    }

    const now = Date.now();

    if (!immediate && lastUploadMsRef.current && now - lastUploadMsRef.current < UPLOAD_INTERVAL_MS) {
      return;
    }

    uploadInFlightRef.current = true;
    const supabase = createSupabaseBrowserClient();
    const { error } = await updateDriverLocation(supabase, orderId, current);
    uploadInFlightRef.current = false;

    if (stoppedRef.current) {
      return;
    }

    if (error) {
      setUploadMessage(locationUploadErrorMessage(error.message));
      return;
    }

    lastUploadMsRef.current = Date.now();
    setLastSentAt(new Date().toISOString());
    setUploadMessage(null);
  }, []);

  const startUploadInterval = useCallback((orderId: string) => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
    }

    intervalRef.current = window.setInterval(() => {
      void uploadLatest(orderId);
    }, UPLOAD_INTERVAL_MS);
  }, [uploadLatest]);

  const handlePosition = useCallback((orderId: string, position: GeolocationPosition) => {
    const payload = positionToPayload(position);

    if (!payload) {
      return;
    }

    latestLocationRef.current = payload;
    setLatestLocation(payload);
    setGpsMessage(null);

    void uploadLatest(orderId, !lastUploadMsRef.current);
  }, [uploadLatest]);

  const handleGpsError = useCallback((error: GeolocationPositionError) => {
    setGpsMessage(gpsErrorMessage(error));
  }, []);

  useEffect(() => {
    const updateOnline = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);

    return () => {
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, []);

  useEffect(() => {
    if (!auth.user || auth.profile?.role !== "driver" || !auth.isDriverOnboardingComplete) {
      const timer = window.setTimeout(() => {
        setActiveOrders([]);
      }, 0);

      return () => window.clearTimeout(timer);
    }

    let cancelled = false;
    const supabase = createSupabaseBrowserClient();

    async function loadTrackableOrders() {
      if (!auth.user) {
        return;
      }

      try {
        const orders = await getDriverTrackableOrders(supabase, auth.user.id);
        if (!cancelled) {
          setActiveOrders(orders);
        }
      } catch {
        if (!cancelled) {
          setActiveOrders([]);
        }
      }
    }

    const initialTimer = window.setTimeout(() => {
      void loadTrackableOrders();
    }, 0);
    const timer = window.setInterval(() => {
      void loadTrackableOrders();
    }, 60 * 1000);

    return () => {
      cancelled = true;
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, [auth.isDriverOnboardingComplete, auth.profile?.role, auth.user, ordersRefreshToken]);

  useEffect(() => {
    cleanupTracking();
    latestLocationRef.current = null;
    lastUploadMsRef.current = 0;
    stoppedRef.current = false;
    window.setTimeout(() => {
      setLatestLocation(null);
      setLastSentAt(null);
      setGpsMessage(null);
      setUploadMessage(null);
    }, 0);

    if (!activeOrder) {
      return cleanupTracking;
    }

    if (!("geolocation" in navigator)) {
      window.setTimeout(() => {
        setGpsMessage("Location is not supported by this browser.");
      }, 0);
      return cleanupTracking;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      maximumAge: 15000,
      timeout: 20000,
    };

    const onSuccess = (position: GeolocationPosition) => handlePosition(activeOrder.id, position);
    const onError = (error: GeolocationPositionError) => handleGpsError(error);

    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
    watchIdRef.current = navigator.geolocation.watchPosition(onSuccess, onError, options);
    startUploadInterval(activeOrder.id);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
        void uploadLatest(activeOrder.id, true);
      }
    };

    const handleOnline = () => {
      void uploadLatest(activeOrder.id, true);
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("online", handleOnline);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("online", handleOnline);
      cleanupTracking();
    };
  }, [
    activeOrder,
    activeOrders.length,
    cleanupTracking,
    handleGpsError,
    handlePosition,
    retryToken,
    startUploadInterval,
    uploadLatest,
  ]);

  const trackingState: TrackingState = useMemo(() => {
    if (activeOrders.length > 1) {
      return activeOrder ? "active" : "multiple_active";
    }

    if (!activeOrder) {
      return "idle";
    }

    if (gpsMessage?.startsWith("Location permission")) {
      return "permission_denied";
    }

    if (gpsMessage) {
      return "location_unavailable";
    }

    return "active";
  }, [activeOrder, activeOrders.length, gpsMessage]);

  const value = useMemo<DriverTrackingContextValue>(
    () => ({
      activeOrders,
      activeOrder,
      selectedOrderId,
      latestLocation,
      lastSentAt,
      trackingState,
      gpsMessage,
      uploadMessage,
      isOnline,
      selectOrder: (orderId) => {
        window.localStorage.setItem("lorry-link-tracking-order", orderId);
        setSelectedOrderId(orderId);
      },
      retry: () => {
        setRetryToken((token) => token + 1);
        setOrdersRefreshToken((token) => token + 1);
      },
    }),
    [
      activeOrder,
      activeOrders,
      gpsMessage,
      isOnline,
      lastSentAt,
      latestLocation,
      selectedOrderId,
      trackingState,
      uploadMessage,
    ],
  );

  return (
    <DriverTrackingContext.Provider value={value}>
      {children}
    </DriverTrackingContext.Provider>
  );
}

export function useDriverTracking() {
  const value = useContext(DriverTrackingContext);

  if (!value) {
    throw new Error("useDriverTracking must be used inside DriverLocationTracker.");
  }

  return value;
}

