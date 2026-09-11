"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Megaphone } from "lucide-react";
import { CreateLoadAdForm } from "@/components/driver/CreateLoadAdForm";
import { DiscoverPickups } from "@/components/driver/DiscoverPickups";
import { DriverJobDetail } from "@/components/driver/DriverJobDetail";
import { DriverJobsTabs } from "@/components/driver/DriverJobsTabs";
import { DriverLoadAdsList } from "@/components/driver/DriverLoadAdsList";
import { DriverPickupDetail } from "@/components/driver/DriverPickupDetail";
import { DriverTrackingExperience } from "@/components/tracking/DriverTrackingExperience";
import { PageError, PageLoading } from "@/components/pages/PageStates";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AppButton } from "@/components/ui/AppButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  getDriverLoadAds,
  type DriverLoadAdWithLorry,
} from "@/lib/ads/driver";
import {
  getAvailableLorries,
  getDriverJob,
  getDriverJobs,
  getOpenPickupOrder,
  getOpenPickupOrders,
  type DriverLorry,
  type DriverOrder,
  type DriverOrderWithLorry,
} from "@/lib/orders/driver";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isUuid } from "@/lib/routing";

export function DriverDiscoverScreen() {
  const searchParams = useSearchParams();
  const unavailable = searchParams.get("unavailable") === "1";
  const [orders, setOrders] = useState<DriverOrder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPickups = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      setOrders(await getOpenPickupOrders(supabase));
    } catch {
      setError("Check your connection and try loading available pickups again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPickups();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadPickups]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Discover Pickups"
        description="Find parcel requests that match your route."
        action={<StatusBadge tone="active">{orders.length} open</StatusBadge>}
      />
      {unavailable ? (
        <div className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-3 text-sm font-semibold text-[var(--brand-orange)]">
          That pickup is no longer available.
        </div>
      ) : null}
      {loading ? <PageLoading /> : error ? <PageError message={error} onRetry={loadPickups} /> : <DiscoverPickups orders={orders} />}
    </div>
  );
}

function DriverPickupDetailContent() {
  const auth = useAuth();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const orderId = searchParams.get("id");
  const [order, setOrder] = useState<DriverOrder | null>(null);
  const [lorries, setLorries] = useState<DriverLorry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPickup = useCallback(async () => {
    if (!auth.user) {
      return;
    }

    if (!isUuid(orderId)) {
      setLoading(false);
      setError("This pickup link is invalid.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const [pickup, availableLorries] = await Promise.all([
        getOpenPickupOrder(supabase, orderId),
        getAvailableLorries(supabase, auth.user.id),
      ]);

      if (!pickup) {
        setError("This pickup is no longer available.");
        setOrder(null);
        return;
      }

      setOrder(pickup);
      setLorries(availableLorries);
    } catch {
      setError("Check your connection and try loading this pickup again.");
    } finally {
      setLoading(false);
    }
  }, [auth.user, orderId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPickup();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadPickup, queryString]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Pickup Details"
        description={order ? `${order.pickup_pincode} to ${order.drop_pincode}` : undefined}
        backHref="/driver/discover"
      />
      {loading ? (
        <PageLoading />
      ) : error || !order ? (
        <PageError message={error ?? "Unable to load this pickup."} onRetry={loadPickup} />
      ) : (
        <DriverPickupDetail order={order} lorries={lorries} />
      )}
    </div>
  );
}

export function DriverPickupDetailScreen() {
  return (
    <Suspense fallback={<PageLoading />}>
      <DriverPickupDetailContent />
    </Suspense>
  );
}

export function DriverJobsScreen() {
  const auth = useAuth();
  const [jobs, setJobs] = useState<DriverOrderWithLorry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadJobs = useCallback(async () => {
    if (!auth.user) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      setJobs(await getDriverJobs(supabase, auth.user.id));
    } catch {
      setError("Check your connection and try loading your jobs again.");
    } finally {
      setLoading(false);
    }
  }, [auth.user]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadJobs();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadJobs]);

  const activeCount = jobs.filter((job) => ["accepted", "picked_up", "in_transit"].includes(job.status)).length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Jobs"
        description="Manage accepted pickups and delivery progress."
        action={<StatusBadge tone="active">{activeCount} active</StatusBadge>}
      />
      {loading ? <PageLoading /> : error ? <PageError message={error} onRetry={loadJobs} /> : <DriverJobsTabs jobs={jobs} />}
    </div>
  );
}

export function DriverLoadAdsScreen() {
  const auth = useAuth();
  const searchParams = useSearchParams();
  const created = searchParams.get("created") === "1";
  const [ads, setAds] = useState<DriverLoadAdWithLorry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAds = useCallback(async () => {
    if (!auth.user) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      setAds(await getDriverLoadAds(supabase, auth.user.id));
    } catch {
      setError("Check your connection and try loading your load ads again.");
    } finally {
      setLoading(false);
    }
  }, [auth.user]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAds();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadAds]);

  const activeCount = ads.filter((ad) => ad.status === "active").length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Load Ads"
        description="Publish your lorry route and available capacity for customers."
        action={<AppButton href="/driver/ads/create" size="sm">Post Ad</AppButton>}
      />
      {created ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-3 text-sm font-semibold text-[var(--success)]">
          Load ad published successfully.
        </div>
      ) : null}
      <StatusBadge tone="active">{activeCount} active</StatusBadge>
      {loading ? <PageLoading /> : error ? <PageError message={error} onRetry={loadAds} /> : <DriverLoadAdsList ads={ads} onRefresh={loadAds} />}
    </div>
  );
}

export function DriverCreateLoadAdScreen() {
  const auth = useAuth();
  const [lorries, setLorries] = useState<DriverLorry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadLorries = useCallback(async () => {
    if (!auth.user) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      setLorries(await getAvailableLorries(supabase, auth.user.id));
    } catch {
      setError("Check your connection and try loading your lorries again.");
    } finally {
      setLoading(false);
    }
  }, [auth.user]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadLorries();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadLorries]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Post Load Ad"
        description="Let customers know your lorry is available for loading."
        backHref="/driver/ads"
      />
      {loading ? (
        <PageLoading />
      ) : error ? (
        <PageError message={error} onRetry={loadLorries} />
      ) : !auth.user ? (
        <PageLoading />
      ) : !lorries.length ? (
        <EmptyState
          icon={Megaphone}
          title="No available lorry"
          description="Add or free up a lorry before posting a load ad."
          action={<AppButton href="/driver/profile">View Profile</AppButton>}
        />
      ) : (
        <CreateLoadAdForm driverId={auth.user.id} lorries={lorries} />
      )}
    </div>
  );
}

function DriverJobDetailContent() {
  const auth = useAuth();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const orderId = searchParams.get("id");
  const [job, setJob] = useState<DriverOrderWithLorry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadJob = useCallback(async () => {
    if (!auth.user) {
      return;
    }

    if (!isUuid(orderId)) {
      setLoading(false);
      setError("This job link is invalid.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const data = await getDriverJob(supabase, auth.user.id, orderId);

      if (!data) {
        setJob(null);
        setError("This job was not found.");
        return;
      }

      setJob(data);
    } catch {
      setError("Check your connection and try loading this job again.");
    } finally {
      setLoading(false);
    }
  }, [auth.user, orderId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadJob();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadJob, queryString]);

  const accepted = searchParams.get("accepted") === "1";
  const pickedUp = searchParams.get("picked_up") === "1";
  const inTransit = searchParams.get("in_transit") === "1";
  const delivered = searchParams.get("delivered") === "1";

  return (
    <div className="space-y-5">
      <PageHeader
        title="Job Details"
        description={job ? `${job.pickup_pincode} to ${job.drop_pincode}` : undefined}
        backHref="/driver/jobs"
      />
      {loading ? (
        <PageLoading />
      ) : error || !job ? (
        <PageError message={error ?? "Unable to load this job."} onRetry={loadJob} />
      ) : (
        <DriverJobDetail
          job={job}
          accepted={accepted}
          pickedUp={pickedUp}
          inTransit={inTransit}
          delivered={delivered}
        />
      )}
    </div>
  );
}

export function DriverJobDetailScreen() {
  return (
    <Suspense fallback={<PageLoading />}>
      <DriverJobDetailContent />
    </Suspense>
  );
}

export function DriverTrackingScreen() {
  return (
    <div className="space-y-5">
      <PageHeader title="Live Tracking" description="Foreground delivery location for the active job." />
      <DriverTrackingExperience initialLocation={null} />
    </div>
  );
}

