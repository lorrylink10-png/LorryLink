"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowRight, CalendarDays, IndianRupee, MapPin, Megaphone, Weight } from "lucide-react";
import { AuthError } from "@/components/auth/AuthError";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput, AppSelect, AppTextarea, FormField } from "@/components/ui/FormControls";
import { createDriverLoadAd } from "@/lib/ads/driver";
import {
  type CreateDriverLoadAdFormValues,
  validateCreateDriverLoadAdForm,
} from "@/lib/ads/validation";
import { driverLoadAdsHref } from "@/lib/routing";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { DriverLorry } from "@/lib/orders/driver";

type CreateLoadAdFormProps = {
  driverId: string;
  lorries: DriverLorry[];
};

const initialValues: CreateDriverLoadAdFormValues = {
  lorryId: "",
  fromPincode: "",
  fromAddress: "",
  toPincode: "",
  toAddress: "",
  availableDate: "",
  capacityKg: "",
  expectedRate: "",
  notes: "",
};

export function CreateLoadAdForm({ driverId, lorries }: CreateLoadAdFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<CreateDriverLoadAdFormValues>(() => ({
    ...initialValues,
    lorryId: lorries[0]?.id ?? "",
    capacityKg: lorries[0]?.capacity_kg ? String(lorries[0].capacity_kg) : "",
  }));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedLorry = useMemo(
    () => lorries.find((lorry) => lorry.id === values.lorryId) ?? null,
    [lorries, values.lorryId],
  );

  function updateField<K extends keyof CreateDriverLoadAdFormValues>(
    field: K,
    value: CreateDriverLoadAdFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleLorryChange(lorryId: string) {
    const lorry = lorries.find((item) => item.id === lorryId);

    setValues((current) => ({
      ...current,
      lorryId,
      capacityKg: lorry?.capacity_kg ? String(lorry.capacity_kg) : current.capacityKg,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError(null);
    const validation = validateCreateDriverLoadAdForm(values);

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

    if (userError || !user || user.id !== driverId) {
      setSubmitting(false);
      setError("Your session has expired. Please sign in again.");
      return;
    }

    const { error: insertError } = await createDriverLoadAd(supabase, driverId, validation.payload);

    if (insertError) {
      setSubmitting(false);
      setError("Unable to publish this load ad. Please check the details and try again.");
      return;
    }

    router.replace(driverLoadAdsHref(true));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AuthError message={error} />

      <AppCard className="space-y-4">
        <div className="flex items-center gap-2 text-base font-bold text-[var(--brand-navy)]">
          <Megaphone size={18} className="text-[var(--brand-orange)]" aria-hidden="true" />
          Lorry Availability
        </div>
        <FormField label="Lorry">
          <AppSelect value={values.lorryId} onChange={(event) => handleLorryChange(event.target.value)}>
            <option value="">No specific lorry</option>
            {lorries.map((lorry) => (
              <option key={lorry.id} value={lorry.id}>
                {lorry.registration_number} - {lorry.vehicle_type}
              </option>
            ))}
          </AppSelect>
        </FormField>
        {selectedLorry ? (
          <div className="rounded-lg bg-blue-50 px-3 py-3 text-sm font-semibold text-[var(--brand-blue)]">
            Selected capacity: {Number(selectedLorry.capacity_kg).toLocaleString("en-IN")} ton
          </div>
        ) : null}
      </AppCard>

      <AppCard className="space-y-4">
        <div className="flex items-center gap-2 text-base font-bold text-[var(--brand-navy)]">
          <MapPin size={18} className="text-[var(--brand-blue)]" aria-hidden="true" />
          Route
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
          <FormField label="From PIN *">
            <AppInput
              inputMode="numeric"
              maxLength={6}
              value={values.fromPincode}
              onChange={(event) => updateField("fromPincode", event.target.value.replace(/\D/g, ""))}
              placeholder="670702"
            />
          </FormField>
          <span className="mb-3 flex h-11 items-center text-[var(--text-secondary)]">
            <ArrowRight size={18} aria-hidden="true" />
          </span>
          <FormField label="To PIN *">
            <AppInput
              inputMode="numeric"
              maxLength={6}
              value={values.toPincode}
              onChange={(event) => updateField("toPincode", event.target.value.replace(/\D/g, ""))}
              placeholder="560001"
            />
          </FormField>
        </div>
        <FormField label="From Address *">
          <AppTextarea
            value={values.fromAddress}
            onChange={(event) => updateField("fromAddress", event.target.value)}
            placeholder="Current loading area, city, district, state"
          />
        </FormField>
        <FormField label="To Address *">
          <AppTextarea
            value={values.toAddress}
            onChange={(event) => updateField("toAddress", event.target.value)}
            placeholder="Preferred unloading route or destination area"
          />
        </FormField>
      </AppCard>

      <AppCard className="space-y-4">
        <div className="flex items-center gap-2 text-base font-bold text-[var(--brand-navy)]">
          <CalendarDays size={18} className="text-[var(--brand-orange)]" aria-hidden="true" />
          Load Details
        </div>
        <FormField label="Available Date *">
          <AppInput
            type="date"
            value={values.availableDate}
            onChange={(event) => updateField("availableDate", event.target.value)}
          />
        </FormField>
        <FormField label="Available Capacity (ton) *">
          <span className="relative block">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
              <Weight size={16} aria-hidden="true" />
            </span>
            <AppInput
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={values.capacityKg}
              onChange={(event) => updateField("capacityKg", event.target.value)}
              className="pl-10"
              placeholder="4.5"
            />
          </span>
        </FormField>
        <FormField label="Expected Rate">
          <span className="relative block">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--text-secondary)]">
              ₹
            </span>
            <AppInput
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={values.expectedRate}
              onChange={(event) => updateField("expectedRate", event.target.value)}
              className="pl-10"
              placeholder="4500"
            />
          </span>
        </FormField>
        <FormField label="Notes">
          <AppTextarea
            value={values.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            placeholder="Example: return trip available, partial load accepted, covered vehicle"
          />
        </FormField>
      </AppCard>

      <AppButton type="submit" className="w-full" disabled={submitting}>
        <IndianRupee size={18} aria-hidden="true" />
        {submitting ? "Publishing Ad..." : "Publish Load Ad"}
      </AppButton>
    </form>
  );
}
