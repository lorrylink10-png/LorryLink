"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Truck } from "lucide-react";
import { AuthError } from "@/components/auth/AuthError";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import {
  acceptPickupOrder,
  driverOrderErrorMessage,
  type DriverLorry,
  type DriverOrder,
} from "@/lib/orders/driver";
import { formatCurrency, formatWeight } from "@/lib/orders/format";
import { driverJobHref } from "@/lib/routing";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type AcceptPickupPanelProps = {
  order: DriverOrder;
  lorries: DriverLorry[];
};

export function AcceptPickupPanel({ order, lorries }: AcceptPickupPanelProps) {
  const router = useRouter();
  const [selectedLorryId, setSelectedLorryId] = useState(lorries.length === 1 ? lorries[0].id : "");
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selectedLorry = useMemo(
    () => lorries.find((lorry) => lorry.id === selectedLorryId) ?? null,
    [lorries, selectedLorryId],
  );

  async function handleAccept() {
    if (!selectedLorryId) {
      setMessage("Choose an available lorry before accepting this pickup.");
      return;
    }

    setLoading(true);
    setMessage(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await acceptPickupOrder(supabase, order.id, selectedLorryId);

    if (error) {
      const friendlyMessage = driverOrderErrorMessage(error);
      setLoading(false);
      setMessage(friendlyMessage);

      if (friendlyMessage === "This pickup was just accepted by another driver.") {
        window.setTimeout(() => {
          router.replace("/driver/discover?unavailable=1");
        }, 1200);
      }

      return;
    }

    router.replace(`${driverJobHref(order.id)}&accepted=1`);
  }

  if (!lorries.length) {
    return (
      <AppCard className="space-y-3 border-orange-200 bg-orange-50">
        <div className="flex items-center gap-2 text-base font-bold text-[var(--brand-navy)]">
          <Truck size={18} className="text-[var(--brand-orange)]" aria-hidden="true" />
          No available lorry
        </div>
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          All your lorries are currently busy or inactive.
        </p>
        <AppButton type="button" className="w-full" disabled>
          Accept Pickup
        </AppButton>
      </AppCard>
    );
  }

  if (confirming) {
    return (
      <div className="space-y-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <AuthError message={message} />
        <div>
          <h2 className="text-base font-bold text-[var(--brand-navy)]">Accept this pickup?</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
            {order.pickup_pincode} -&gt; {order.drop_pincode} - {formatWeight(order.weight_kg)} -{" "}
            {formatCurrency(order.budget)}
          </p>
        </div>
        {selectedLorry ? (
          <div className="rounded-lg bg-white p-3 text-sm">
            <p className="font-bold text-[var(--brand-navy)]">Lorry</p>
            <p className="mt-1 font-semibold text-[var(--text-secondary)]">
              {selectedLorry.registration_number} - {selectedLorry.vehicle_type}
            </p>
          </div>
        ) : null}
        <div className="grid grid-cols-2 gap-3">
          <AppButton
            type="button"
            variant="outline"
            onClick={() => setConfirming(false)}
            disabled={loading}
          >
            Not Now
          </AppButton>
          <AppButton type="button" onClick={handleAccept} disabled={loading}>
            {loading ? "Accepting pickup..." : "Accept Pickup"}
          </AppButton>
        </div>
      </div>
    );
  }

  return (
    <AppCard className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-[var(--brand-navy)]">Accept Pickup</h2>
        <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
          Select the lorry you will use for this job.
        </p>
      </div>

      <AuthError message={message} />

      <div className="space-y-3">
        <p className="text-xs font-bold uppercase text-[var(--text-secondary)]">Choose Lorry</p>
        {lorries.map((lorry) => {
          const selected = lorry.id === selectedLorryId;

          return (
            <button
              key={lorry.id}
              type="button"
              onClick={() => setSelectedLorryId(lorry.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-lg border bg-white p-3 text-left transition",
                selected ? "border-[var(--brand-blue)] ring-4 ring-blue-100" : "border-[var(--border)]",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                  selected ? "border-[var(--brand-blue)] bg-[var(--brand-blue)] text-white" : "border-slate-300",
                )}
              >
                {selected ? <CheckCircle2 size={14} aria-hidden="true" /> : null}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-[var(--brand-navy)]">
                  {lorry.registration_number}
                </span>
                <span className="mt-1 block text-xs font-semibold text-[var(--text-secondary)]">
                  {lorry.vehicle_type} - {formatWeight(lorry.capacity_kg)}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <AppButton
        type="button"
        className="w-full"
        disabled={!selectedLorryId}
        onClick={() => {
          setMessage(null);
          setConfirming(true);
        }}
      >
        Accept Pickup
      </AppButton>
    </AppCard>
  );
}

