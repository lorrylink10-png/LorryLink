import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type DriverOrder = Database["public"]["Tables"]["pickup_orders"]["Row"];
export type DriverLorry = Database["public"]["Tables"]["lorries"]["Row"];

export type DriverOrderWithLorry = DriverOrder & {
  assignedLorry: DriverLorry | null;
};

export async function getOpenPickupOrders(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("pickup_orders")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getOpenPickupOrder(
  supabase: SupabaseClient<Database>,
  orderId: string,
) {
  const { data, error } = await supabase
    .from("pickup_orders")
    .select("*")
    .eq("id", orderId)
    .eq("status", "open")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getAvailableLorries(
  supabase: SupabaseClient<Database>,
  driverId: string,
) {
  const { data, error } = await supabase
    .from("lorries")
    .select("*")
    .eq("driver_id", driverId)
    .eq("status", "available")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getDriverJobs(
  supabase: SupabaseClient<Database>,
  driverId: string,
): Promise<DriverOrderWithLorry[]> {
  const { data, error } = await supabase
    .from("pickup_orders")
    .select("*")
    .eq("assigned_driver_id", driverId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return attachAssignedLorries(supabase, data ?? []);
}

export async function getDriverJob(
  supabase: SupabaseClient<Database>,
  driverId: string,
  orderId: string,
): Promise<DriverOrderWithLorry | null> {
  const { data, error } = await supabase
    .from("pickup_orders")
    .select("*")
    .eq("id", orderId)
    .eq("assigned_driver_id", driverId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const [job] = await attachAssignedLorries(supabase, [data]);
  return job ?? null;
}

async function attachAssignedLorries(
  supabase: SupabaseClient<Database>,
  orders: DriverOrder[],
): Promise<DriverOrderWithLorry[]> {
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

  const { data, error } = await supabase.from("lorries").select("*").in("id", lorryIds);

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

export function acceptPickupOrder(
  supabase: SupabaseClient<Database>,
  orderId: string,
  lorryId: string,
) {
  return supabase.rpc("accept_pickup_order", {
    p_order_id: orderId,
    p_lorry_id: lorryId,
  });
}

export function markOrderPickedUp(supabase: SupabaseClient<Database>, orderId: string) {
  return supabase.rpc("mark_order_picked_up", {
    p_order_id: orderId,
  });
}

export function markOrderInTransit(supabase: SupabaseClient<Database>, orderId: string) {
  return supabase.rpc("mark_order_in_transit", {
    p_order_id: orderId,
  });
}

export function markOrderDelivered(supabase: SupabaseClient<Database>, orderId: string) {
  return supabase.rpc("mark_order_delivered", {
    p_order_id: orderId,
  });
}

export function driverOrderErrorMessage(error: Pick<PostgrestError, "message"> | null) {
  if (!error) {
    return null;
  }

  const message = error.message.toLowerCase();

  if (message.includes("no longer available")) {
    return "This pickup was just accepted by another driver.";
  }

  if (message.includes("selected lorry is not available")) {
    return "This lorry is no longer available. Choose another lorry and try again.";
  }

  if (message.includes("does not belong")) {
    return "That lorry cannot be used for this pickup.";
  }

  if (message.includes("only drivers")) {
    return "Only driver accounts can manage pickup jobs.";
  }

  if (message.includes("authentication")) {
    return "Your session expired. Please sign in again.";
  }

  if (message.includes("picked up")) {
    return "This pickup cannot be marked as picked up right now.";
  }

  if (message.includes("in transit")) {
    return "This pickup cannot be started right now.";
  }

  if (message.includes("delivered")) {
    return "This pickup cannot be marked as delivered right now.";
  }

  return "Something went wrong. Refresh and try again.";
}
