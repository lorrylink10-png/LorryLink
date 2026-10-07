"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, IndianRupee, LocateFixed, MapPin, Navigation, Package } from "lucide-react";
import { AuthError } from "@/components/auth/AuthError";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput, AppTextarea, FormField } from "@/components/ui/FormControls";
import { createPickupOrder } from "@/lib/orders/customer";
import {
  type CreatePickupFormValues,
  type PickupLocation,
  validateCreatePickupForm,
} from "@/lib/orders/validation";
import { customerOrderHref } from "@/lib/routing";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type CreatePickupFormProps = {
  customerId: string;
};

const initialValues: CreatePickupFormValues = {
  pickupPincode: "",
  pickupAddress: "",
  pickupLocation: null,
  dropPincode: "",
  dropAddress: "",
  parcelName: "",
  parcelDetails: "",
  weightKg: "",
  lengthCm: "",
  widthCm: "",
  heightCm: "",
  budget: "",
};

function getLocationError(error: GeolocationPositionError) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "We couldn't access your location. Allow location permission and try again.";
    case error.POSITION_UNAVAILABLE:
      return "Location is unavailable right now. Check GPS and try again.";
    case error.TIMEOUT:
      return "GPS request timed out. Please try again.";
    default:
      return "Unable to capture location. Please try again.";
  }
}

export function CreatePickupForm({ customerId }: CreatePickupFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<CreatePickupFormValues>(initialValues);
  const [locationLoading, setLocationLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  function updateField<K extends keyof CreatePickupFormValues>(field: K, value: CreatePickupFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function captureLocation() {
    setLocationError(null);
    setError(null);

    if (!navigator.geolocation) {
      setLocationError("This browser does not support geolocation.");
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: PickupLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        updateField("pickupLocation", location);
        setLocationLoading(false);
      },
      (geoError) => {
        setLocationLoading(false);
        setLocationError(getLocationError(geoError));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      },
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError(null);
    const validation = validateCreatePickupForm(values);

    if (!validation.ok) {
      setError(validation.message);
      return;
    }

    setSubmitting(true);
    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user || user.id !== customerId) {
      setSubmitting(false);
      setError("Your session has expired. Please sign in again.");
      return;
    }

    const { data, error: insertError } = await createPickupOrder(supabase, user.id, validation.payload);

    if (insertError || !data?.id) {
      setSubmitting(false);
      setError("Unable to create pickup. Please check the details and try again.");
      return;
    }

    router.replace(`${customerOrderHref(data.id)}&created=1`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AuthError message={error} />

      <AppCard className="space-y-4">
        <div className="flex items-center gap-2 text-base font-bold text-[var(--brand-navy)]">
          <MapPin size={18} className="text-[var(--brand-orange)]" aria-hidden="true" />
          Pickup Location
        </div>
        <FormField label="Pickup PIN Code *">
          <AppInput
            value={values.pickupPincode}
            onChange={(event) => updateField("pickupPincode", event.target.value)}
            inputMode="numeric"
            maxLength={6}
            placeholder="670702"
          />
        </FormField>
        <FormField label="Complete Pickup Address *">
          <AppTextarea
            value={values.pickupAddress}
            onChange={(event) => updateField("pickupAddress", event.target.value)}
            placeholder="House/building, road, area, city, district, state"
          />
        </FormField>
        <div className="space-y-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-subtle)] p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--brand-navy)]">
            <LocateFixed size={17} className="text-[var(--brand-orange)]" aria-hidden="true" />
            Exact Pickup Location *
          </div>
          {values.pickupLocation ? (
            <div className="rounded-lg bg-white p-3 text-sm">
              <div className="mb-2 flex items-center gap-2 font-bold text-[var(--success)]">
                <CheckCircle2 size={17} aria-hidden="true" />
                Pickup location added
              </div>
              <p className="text-[var(--text-secondary)]">
                Latitude: {values.pickupLocation.latitude.toFixed(6)}
              </p>
              <p className="text-[var(--text-secondary)]">
                Longitude: {values.pickupLocation.longitude.toFixed(6)}
              </p>
            </div>
          ) : (
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              Capture the exact pickup point once before publishing.
            </p>
          )}
          {locationError ? <AuthError message={locationError} /> : null}
          <AppButton type="button" variant="accent" className="w-full" onClick={captureLocation} disabled={locationLoading}>
            <Navigation size={18} aria-hidden="true" />
            {locationLoading ? "Getting Location..." : values.pickupLocation ? "Update Location" : "Use My Current Location"}
          </AppButton>
        </div>
      </AppCard>

      <AppCard className="space-y-4">
        <div className="flex items-center gap-2 text-base font-bold text-[var(--brand-navy)]">
          <MapPin size={18} className="text-[var(--brand-blue)]" aria-hidden="true" />
          Drop Location
        </div>
        <FormField label="Drop PIN Code *">
          <AppInput
            value={values.dropPincode}
            onChange={(event) => updateField("dropPincode", event.target.value)}
            inputMode="numeric"
            maxLength={6}
            placeholder="560001"
          />
        </FormField>
        <FormField label="Complete Drop Address *">
          <AppTextarea
            value={values.dropAddress}
            onChange={(event) => updateField("dropAddress", event.target.value)}
            placeholder="Building, road, area, city, district, state"
          />
        </FormField>
      </AppCard>

      <AppCard className="space-y-4">
        <div className="flex items-center gap-2 text-base font-bold text-[var(--brand-navy)]">
          <Package size={18} className="text-[var(--brand-blue)]" aria-hidden="true" />
          Parcel Details
        </div>
        <FormField label="Parcel / Item Name *">
          <AppInput
            value={values.parcelName}
            onChange={(event) => updateField("parcelName", event.target.value)}
            placeholder="Furniture"
          />
        </FormField>
        <FormField label="Parcel Details">
          <AppTextarea
            value={values.parcelDetails}
            onChange={(event) => updateField("parcelDetails", event.target.value)}
            placeholder="Wooden dining table and six chairs. Handle carefully."
          />
        </FormField>
        <FormField label="Weight (ton) *">
          <AppInput
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            value={values.weightKg}
            onChange={(event) => updateField("weightKg", event.target.value)}
            placeholder="1.5"
          />
        </FormField>
        <div className="grid grid-cols-3 gap-2">
          <FormField label="Length">
            <AppInput
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={values.lengthCm}
              onChange={(event) => updateField("lengthCm", event.target.value)}
              placeholder="ft"
            />
          </FormField>
          <FormField label="Width">
            <AppInput
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={values.widthCm}
              onChange={(event) => updateField("widthCm", event.target.value)}
              placeholder="ft"
            />
          </FormField>
          <FormField label="Height">
            <AppInput
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={values.heightCm}
              onChange={(event) => updateField("heightCm", event.target.value)}
              placeholder="ft"
            />
          </FormField>
        </div>
      </AppCard>

      <AppCard className="space-y-4">
        <div className="flex items-center gap-2 text-base font-bold text-[var(--brand-navy)]">
          <IndianRupee size={18} className="text-[var(--brand-orange)]" aria-hidden="true" />
          Budget
        </div>
        <FormField label="Your Budget *">
          <span className="relative block">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--text-secondary)]">
              ₹
            </span>
            <AppInput
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={values.budget}
              onChange={(event) => updateField("budget", event.target.value)}
              className="pl-10"
              placeholder="3500"
            />
          </span>
        </FormField>
      </AppCard>

      <AppButton type="submit" className="w-full" disabled={submitting || locationLoading}>
        {submitting ? "Creating Pickup..." : "Create Pickup"}
      </AppButton>
    </form>
  );
}

