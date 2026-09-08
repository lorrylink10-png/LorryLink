"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CustomerHome } from "@/components/customer/CustomerHome";
import { CreatePickupForm } from "@/components/customer/CreatePickupForm";
import { OrderDetail } from "@/components/customer/OrderDetail";
import { OrdersTabs } from "@/components/customer/OrdersTabs";
import { CustomerLiveTracking } from "@/components/tracking/CustomerLiveTracking";
import { CustomerTrackingList } from "@/components/tracking/CustomerTrackingList";
import { PageError, PageLoading } from "@/components/pages/PageStates";
import { useAuth } from "@/components/auth/AuthProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  getCustomerHomeData,
  getCustomerOrderDetailData,
  getCustomerOrders,
  type CustomerOrder,
  type CustomerOrderDetailData,
} from "@/lib/orders/customer";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  getCustomerTrackableOrder,
  getCustomerTrackableOrders,
  getDriverLocationForOrder,
} from "@/lib/tracking/queries";
import type { DriverLocationRow, TrackableOrderWithLorry } from "@/lib/tracking/types";
import { customerOrderHref, customerOrderTrackingHref, isUuid } from "@/lib/routing";

export function CustomerCreateScreen() {
  const auth = useAuth();

  if (!auth.user) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Create Pickup" description="Tell nearby lorry drivers what you need to move." />
      <CreatePickupForm customerId={auth.user.id} />
    </div>
  );
}

export function CustomerHomeScreen() {
  const auth = useAuth();
  const [orders, setOrders] = useState<{
    activeOrder: CustomerOrder | null;
    recentOrders: CustomerOrder[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadHome = useCallback(async () => {
    if (!auth.user) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      setOrders(await getCustomerHomeData(supabase, auth.user.id));
    } catch {
      setError("Check your connection and try loading your pickups again.");
    } finally {
      setLoading(false);
    }
  }, [auth.user]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadHome();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadHome]);

  if (loading) {
    return <PageLoading />;
  }

  if (error || !orders) {
    return <PageError message={error ?? "Unable to load your home data."} onRetry={loadHome} />;
  }

  return (
    <CustomerHome
      profileName={auth.profile?.full_name}
      activeOrder={orders.activeOrder}
      recentOrders={orders.recentOrders}
    />
  );
}

export function CustomerOrdersScreen() {
  const auth = useAuth();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    if (!auth.user) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      setOrders(await getCustomerOrders(supabase, auth.user.id));
    } catch {
      setError("Check your connection and try loading your orders again.");
    } finally {
      setLoading(false);
    }
  }, [auth.user]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadOrders();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadOrders]);

  return (
    <div className="space-y-5">
      <PageHeader title="Orders" description="Track your pickup requests and delivery history." />
      {loading ? <PageLoading /> : error ? <PageError message={error} onRetry={loadOrders} /> : <OrdersTabs orders={orders} />}
    </div>
  );
}

function CustomerOrderDetailContent() {
  const auth = useAuth();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const orderId = searchParams.get("id");
  const created = searchParams.get("created") === "1";
  const cancelled = searchParams.get("cancelled") === "1";
  const [detail, setDetail] = useState<CustomerOrderDetailData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOrder = useCallback(async () => {
    if (!auth.user) {
      return;
    }

    if (!isUuid(orderId)) {
      setLoading(false);
      setError("This order link is invalid.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const data = await getCustomerOrderDetailData(supabase, auth.user.id, orderId);

      if (!data) {
        setError("This order was not found.");
        setDetail(null);
        return;
      }

      setDetail(data);
    } catch {
      setError("Check your connection and try loading this order again.");
    } finally {
      setLoading(false);
    }
  }, [auth.user, orderId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadOrder();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadOrder, queryString]);

  return (
    <div className="space-y-5">
      <PageHeader title="Order Details" description={detail?.order.parcel_name} backHref="/customer/orders" />
      {loading ? (
        <PageLoading />
      ) : error || !detail ? (
        <PageError message={error ?? "Unable to load this order."} onRetry={loadOrder} />
      ) : (
        <OrderDetail
          order={detail.order}
          assignedLorry={detail.assignedLorry}
          created={created}
          cancelled={cancelled}
        />
      )}
    </div>
  );
}

export function CustomerOrderDetailScreen() {
  return (
    <Suspense fallback={<PageLoading />}>
      <CustomerOrderDetailContent />
    </Suspense>
  );
}

export function CustomerTrackingScreen() {
  const auth = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<TrackableOrderWithLorry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    if (!auth.user) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const data = await getCustomerTrackableOrders(supabase, auth.user.id);
      setOrders(data);

      if (data.length === 1) {
        router.replace(customerOrderTrackingHref(data[0].id));
      }
    } catch {
      setError("Check your connection and try loading tracking again.");
    } finally {
      setLoading(false);
    }
  }, [auth.user, router]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadOrders();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadOrders]);

  return (
    <div className="space-y-5">
      <PageHeader title="Tracking" description="Live delivery tracking for picked-up parcels." />
      {loading ? <PageLoading /> : error ? <PageError message={error} onRetry={loadOrders} /> : <CustomerTrackingList orders={orders} />}
    </div>
  );
}

function CustomerLiveTrackingContent() {
  const auth = useAuth();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const [order, setOrder] = useState<TrackableOrderWithLorry | null>(null);
  const [location, setLocation] = useState<DriverLocationRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTracking = useCallback(async () => {
    if (!auth.user) {
      return;
    }

    if (!isUuid(orderId)) {
      setLoading(false);
      setError("This tracking link is invalid.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const data = await getCustomerTrackableOrder(supabase, auth.user.id, orderId);

      if (!data) {
        setOrder(null);
        setError("Live tracking is not available for this order.");
        return;
      }

      const initialLocation = await getDriverLocationForOrder(supabase, data.id);
      setOrder(data);
      setLocation(initialLocation);
    } catch {
      setError("Check your connection and try loading live tracking again.");
    } finally {
      setLoading(false);
    }
  }, [auth.user, orderId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTracking();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadTracking]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Live Delivery"
        description={order ? `${order.pickup_pincode} to ${order.drop_pincode}` : undefined}
        backHref={order ? customerOrderHref(order.id) : "/customer/tracking"}
      />
      {loading ? (
        <PageLoading />
      ) : error || !order ? (
        <PageError message={error ?? "Unable to load live tracking."} onRetry={loadTracking} />
      ) : (
        <CustomerLiveTracking order={order} initialLocation={location} />
      )}
    </div>
  );
}

export function CustomerLiveTrackingScreen() {
  return (
    <Suspense fallback={<PageLoading />}>
      <CustomerLiveTrackingContent />
    </Suspense>
  );
}

