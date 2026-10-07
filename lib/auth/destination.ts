import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type DriverProfileRow = Database["public"]["Tables"]["driver_profiles"]["Row"];
type LorryRow = Database["public"]["Tables"]["lorries"]["Row"];

export type AuthRoutingState = {
  user: User | null;
  profile: ProfileRow | null;
  driverProfile: DriverProfileRow | null;
  firstLorry: Pick<LorryRow, "id" | "registration_number" | "vehicle_type" | "capacity_kg" | "length_ft" | "width_ft"> | null;
  isDriverOnboardingComplete: boolean;
  destination: string;
};

export async function getUserDestination(
  supabase: SupabaseClient<Database>,
): Promise<AuthRoutingState> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      profile: null,
      driverProfile: null,
      firstLorry: null,
      isDriverOnboardingComplete: false,
      destination: "/login",
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, phone, email, role, avatar_url, created_at, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role === null) {
    return {
      user,
      profile: profile ?? null,
      driverProfile: null,
      firstLorry: null,
      isDriverOnboardingComplete: false,
      destination: "/onboarding/role",
    };
  }

  if (profile.role === "customer") {
    return {
      user,
      profile,
      driverProfile: null,
      firstLorry: null,
      isDriverOnboardingComplete: true,
      destination: "/customer/home",
    };
  }

  const [{ data: driverProfile }, { data: lorries }] = await Promise.all([
    supabase
      .from("driver_profiles")
      .select("id, user_id, driving_license_no, address, verification_status, created_at, updated_at")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("lorries")
      .select("id, registration_number, vehicle_type, capacity_kg, length_ft, width_ft")
      .eq("driver_id", user.id)
      .limit(1),
  ]);

  const firstLorry = lorries?.[0] ?? null;
  const isDriverOnboardingComplete =
    Boolean(driverProfile?.driving_license_no?.trim()) && Boolean(firstLorry);

  return {
    user,
    profile,
    driverProfile: driverProfile ?? null,
    firstLorry,
    isDriverOnboardingComplete,
    destination: isDriverOnboardingComplete ? "/driver/discover" : "/onboarding/driver",
  };
}

