import type { Database } from "@/types/database";

export type DriverLocationRow = Database["public"]["Tables"]["driver_locations"]["Row"];
export type TrackableOrder = Database["public"]["Tables"]["pickup_orders"]["Row"];

export type LocationPayload = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  recordedAt: string;
};

export type TrackableOrderWithLorry = TrackableOrder & {
  assignedLorry: Pick<
    Database["public"]["Tables"]["lorries"]["Row"],
    "id" | "registration_number" | "vehicle_type" | "capacity_kg" | "length_ft" | "width_ft"
  > | null;
};

