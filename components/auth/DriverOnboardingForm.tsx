"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthError } from "@/components/auth/AuthError";
import { useAuth } from "@/components/auth/AuthProvider";
import { authErrorMessage } from "@/components/auth/auth-messages";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput, AppSelect, AppTextarea, FormField } from "@/components/ui/FormControls";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type DriverOnboardingFormProps = {
  userId: string;
  initialLicense?: string | null;
  initialAddress?: string | null;
};

const vehicleTypes = [
  "Mini Truck",
  "Pickup Truck",
  "Light Commercial Vehicle",
  "Medium Truck",
  "Heavy Truck",
  "Container Truck",
  "Other",
];

export function DriverOnboardingForm({
  userId,
  initialLicense,
  initialAddress,
}: DriverOnboardingFormProps) {
  const router = useRouter();
  const auth = useAuth();
  const [license, setLicense] = useState(initialLicense ?? "");
  const [address, setAddress] = useState(initialAddress ?? "");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [capacityKg, setCapacityKg] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const normalizedLicense = license.trim().toUpperCase();
    const normalizedRegistration = registrationNumber.trim().toUpperCase().replace(/\s+/g, "");
    const capacity = Number(capacityKg);

    if (!normalizedLicense || !normalizedRegistration || !vehicleType || !capacityKg) {
      setError("Complete all required driver and lorry fields.");
      return;
    }

    if (!Number.isFinite(capacity) || capacity <= 0) {
      setError("Enter a valid maximum capacity.");
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();

    const { data: existingProfile, error: existingProfileError } = await supabase
      .from("driver_profiles")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingProfileError) {
      setLoading(false);
      setError(authErrorMessage(existingProfileError.message));
      return;
    }

    const { data: existingLorries } = await supabase
      .from("lorries")
      .select("id")
      .eq("driver_id", userId)
      .limit(1);

    const profilePayload = {
      driving_license_no: normalizedLicense,
      address: address.trim() || null,
    };

    const { error: profileError } = existingProfile
      ? await supabase.from("driver_profiles").update(profilePayload).eq("user_id", userId)
      : await supabase.from("driver_profiles").insert({
          user_id: userId,
          ...profilePayload,
        });

    if (profileError) {
      setLoading(false);
      setError(authErrorMessage(profileError.message));
      return;
    }

    if (existingLorries?.length) {
      await auth.refreshAuth();
      router.replace("/driver/discover");
      return;
    }

    const { error: lorryError } = await supabase.from("lorries").insert({
      driver_id: userId,
      registration_number: normalizedRegistration,
      vehicle_name: vehicleName.trim() || null,
      vehicle_type: vehicleType,
      capacity_kg: capacity,
    });

    if (lorryError) {
      setLoading(false);
      setError(authErrorMessage(lorryError.message));
      return;
    }

    await auth.refreshAuth();
    router.replace("/driver/discover");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AuthError message={error} />

      <AppCard className="space-y-4">
        <div>
          <p className="text-sm font-bold text-[var(--brand-blue)]">Step 2 of 2</p>
          <h2 className="mt-1 text-lg font-bold text-[var(--brand-navy)]">Complete Driver Profile</h2>
        </div>
        <FormField label="Driving Licence Number *">
          <AppInput value={license} onChange={(event) => setLicense(event.target.value)} />
        </FormField>
        <FormField label="Address">
          <AppTextarea value={address} onChange={(event) => setAddress(event.target.value)} />
        </FormField>
      </AppCard>

      <AppCard className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--brand-navy)]">Lorry Details</h2>
        <FormField label="Registration Number *" hint="Spaces are removed and letters are saved in uppercase.">
          <AppInput
            value={registrationNumber}
            onChange={(event) => setRegistrationNumber(event.target.value)}
            placeholder="KL13AB1234"
          />
        </FormField>
        <FormField label="Vehicle Name">
          <AppInput value={vehicleName} onChange={(event) => setVehicleName(event.target.value)} />
        </FormField>
        <FormField label="Vehicle Type *">
          <AppSelect value={vehicleType} onChange={(event) => setVehicleType(event.target.value)}>
            <option value="">Select vehicle type</option>
            {vehicleTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </AppSelect>
        </FormField>
        <FormField label="Maximum Capacity (kg) *">
          <AppInput
            type="number"
            min="1"
            inputMode="decimal"
            value={capacityKg}
            onChange={(event) => setCapacityKg(event.target.value)}
          />
        </FormField>
      </AppCard>

      <AppButton type="submit" className="w-full" disabled={loading}>
        {loading ? "Saving driver details..." : "Complete Setup"}
      </AppButton>
    </form>
  );
}

