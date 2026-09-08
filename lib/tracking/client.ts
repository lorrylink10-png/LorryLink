import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { LocationPayload } from "@/lib/tracking/types";

export function updateDriverLocation(
  supabase: SupabaseClient<Database>,
  orderId: string,
  location: LocationPayload,
) {
  return supabase.rpc("update_driver_location", {
    p_order_id: orderId,
    p_latitude: location.latitude,
    p_longitude: location.longitude,
    p_accuracy: location.accuracy,
    p_heading: location.heading,
    p_speed: location.speed,
    p_recorded_at: location.recordedAt,
  });
}

export function locationUploadErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("not active")) {
    return "This delivery is no longer active for live tracking.";
  }

  if (normalized.includes("authentication")) {
    return "Your session expired. Please sign in again.";
  }

  if (normalized.includes("only drivers")) {
    return "Only the assigned driver can update this delivery location.";
  }

  if (normalized.includes("invalid")) {
    return "The browser reported an invalid GPS position.";
  }

  return "Unable to send your current location. Lorry Link will retry with the next GPS update.";
}
