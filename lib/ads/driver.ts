import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { CreateDriverLoadAdPayload } from "@/lib/ads/validation";

export type DriverLoadAd = Database["public"]["Tables"]["driver_load_ads"]["Row"];
export type DriverLoadAdLorry = Pick<
  Database["public"]["Tables"]["lorries"]["Row"],
  "id" | "registration_number" | "vehicle_type" | "capacity_kg" | "length_ft" | "width_ft"
>;

export type DriverLoadAdWithLorry = DriverLoadAd & {
  lorry: DriverLoadAdLorry | null;
};

export async function createDriverLoadAd(
  supabase: SupabaseClient<Database>,
  driverId: string,
  payload: CreateDriverLoadAdPayload,
) {
  return supabase
    .from("driver_load_ads")
    .insert({
      driver_id: driverId,
      ...payload,
    })
    .select("id")
    .single();
}

export async function getDriverLoadAds(
  supabase: SupabaseClient<Database>,
  driverId: string,
): Promise<DriverLoadAdWithLorry[]> {
  const { data, error } = await supabase
    .from("driver_load_ads")
    .select("*")
    .eq("driver_id", driverId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return attachLorries(supabase, data ?? []);
}

export function closeDriverLoadAd(
  supabase: SupabaseClient<Database>,
  adId: string,
) {
  return supabase
    .from("driver_load_ads")
    .update({ status: "closed" })
    .eq("id", adId);
}

async function attachLorries(
  supabase: SupabaseClient<Database>,
  ads: DriverLoadAd[],
): Promise<DriverLoadAdWithLorry[]> {
  const lorryIds = Array.from(
    new Set(ads.map((ad) => ad.lorry_id).filter((id): id is string => Boolean(id))),
  );

  if (!lorryIds.length) {
    return ads.map((ad) => ({ ...ad, lorry: null }));
  }

  const { data, error } = await supabase
    .from("lorries")
    .select("id, registration_number, vehicle_type, capacity_kg, length_ft, width_ft")
    .in("id", lorryIds);

  if (error) {
    throw new Error(error.message);
  }

  const lorriesById = new Map((data ?? []).map((lorry) => [lorry.id, lorry]));

  return ads.map((ad) => ({
    ...ad,
    lorry: ad.lorry_id ? lorriesById.get(ad.lorry_id) ?? null : null,
  }));
}
