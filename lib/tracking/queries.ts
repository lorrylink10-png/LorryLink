import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type {
  DriverLocationRow,
  TrackableOrder,
  TrackableOrderWithLorry,
} from "@/lib/tracking/types";

const trackableStatuses = ["picked_up", "in_transit"] as const;

export async function getDriverTrackableOrders(
  supabase: SupabaseClient<Database>,
  driverId: string,
) {
  const { data, error } = await supabase
    .from("pickup_orders")
    .select("*")
    .eq("assigned_driver_id", driverId)
    .in("status", trackableStatuses)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getDriverLocationForOrder(
  supabase: SupabaseClient<Database>,
  orderId: string,
): Promise<DriverLocationRow | null> {
  const { data, error } = await supabase
    .from("driver_locations")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? null;
}

export async function getCustomerTrackableOrders(
  supabase: SupabaseClient<Database>,
  customerId: string,
): Promise<TrackableOrderWithLorry[]> {
  const { data, error } = await supabase
    .from("pickup_orders")
    .select("*")
    .eq("customer_id", customerId)
    .in("status", trackableStatuses)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return attachAssignedLorries(supabase, data ?? []);
}

export async function getCustomerTrackableOrder(
  supabase: SupabaseClient<Database>,
  customerId: string,
  orderId: string,
): Promise<TrackableOrderWithLorry | null> {
  const { data, error } = await supabase
    .from("pickup_orders")
    .select("*")
    .eq("id", orderId)
    .eq("customer_id", customerId)
    .in("status", trackableStatuses)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const [order] = await attachAssignedLorries(supabase, [data]);
  return order ?? null;
}

async function attachAssignedLorries(
  supabase: SupabaseClient<Database>,
  orders: TrackableOrder[],
): Promise<TrackableOrderWithLorry[]> {
  const lorryIds = Array.from(
    new Set(
      orders
        .map((order) => order.assigned_lorry_id)
        .filter((id): id is string => Boolean(id)),
    ),
  );

  if (!lorryIds.length) {
    return orders.map((order) => ({ ...order, assignedLorry: null }));
  }

  const { data, error } = await supabase
    .from("lorries")
    .select("id, registration_number, vehicle_type, capacity_kg, length_ft, width_ft")
    .in("id", lorryIds);

  if (error) {
    throw new Error(error.message);
  }

  const lorriesById = new Map((data ?? []).map((lorry) => [lorry.id, lorry]));

  return orders.map((order) => ({
    ...order,
    assignedLorry: order.assigned_lorry_id
      ? lorriesById.get(order.assigned_lorry_id) ?? null
      : null,
  }));
}

