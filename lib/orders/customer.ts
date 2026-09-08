import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { CreatePickupPayload } from "@/lib/orders/validation";

export type CustomerOrder = Database["public"]["Tables"]["pickup_orders"]["Row"];
export type CustomerAssignedLorry = Pick<
  Database["public"]["Tables"]["lorries"]["Row"],
  "id" | "registration_number" | "vehicle_type" | "capacity_kg"
>;

export type CustomerOrderDetailData = {
  order: CustomerOrder;
  assignedLorry: CustomerAssignedLorry | null;
};

export async function createPickupOrder(
  supabase: SupabaseClient<Database>,
  customerId: string,
  payload: CreatePickupPayload,
) {
  return supabase
    .from("pickup_orders")
    .insert({
      customer_id: customerId,
      ...payload,
    })
    .select("id")
    .single();
}

export async function getCustomerOrders(supabase: SupabaseClient<Database>, customerId: string) {
  const { data, error } = await supabase
    .from("pickup_orders")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getCustomerOrder(
  supabase: SupabaseClient<Database>,
  customerId: string,
  orderId: string,
) {
  const { data, error } = await supabase
    .from("pickup_orders")
    .select("*")
    .eq("id", orderId)
    .eq("customer_id", customerId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getCustomerOrderDetailData(
  supabase: SupabaseClient<Database>,
  customerId: string,
  orderId: string,
): Promise<CustomerOrderDetailData | null> {
  const order = await getCustomerOrder(supabase, customerId, orderId);

  if (!order) {
    return null;
  }

  if (!order.assigned_lorry_id) {
    return {
      order,
      assignedLorry: null,
    };
  }

  const { data: assignedLorry, error } = await supabase
    .from("lorries")
    .select("id, registration_number, vehicle_type, capacity_kg")
    .eq("id", order.assigned_lorry_id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return {
    order,
    assignedLorry: assignedLorry ?? null,
  };
}

export async function getCustomerHomeData(supabase: SupabaseClient<Database>, customerId: string) {
  const { data, error } = await supabase
    .from("pickup_orders")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(error.message);
  }

  const orders = data ?? [];
  const activeOrder =
    orders.find((order) => ["open", "accepted", "picked_up", "in_transit"].includes(order.status)) ?? null;

  return {
    activeOrder,
    recentOrders: orders.slice(0, 3),
  };
}

export async function cancelPickupOrder(supabase: SupabaseClient<Database>, orderId: string) {
  return supabase.rpc("cancel_pickup_order", {
    p_order_id: orderId,
  });
}

