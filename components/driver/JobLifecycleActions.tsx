"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthError } from "@/components/auth/AuthError";
import { AppButton } from "@/components/ui/AppButton";
import {
  driverOrderErrorMessage,
  markOrderDelivered,
  markOrderInTransit,
  markOrderPickedUp,
  type DriverOrder,
} from "@/lib/orders/driver";
import { driverJobHref } from "@/lib/routing";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type JobLifecycleActionsProps = {
  job: DriverOrder;
};

type ActionConfig = {
  title: string;
  description: string;
  cancelLabel: string;
  confirmLabel: string;
  loadingLabel: string;
  successParam: string;
  run: (orderId: string) => ReturnType<typeof markOrderPickedUp>;
};

const actionByStatus: Partial<Record<DriverOrder["status"], ActionConfig>> = {
  accepted: {
    title: "Confirm item pickup?",
    description: "Only continue after you have physically collected the parcel.",
    cancelLabel: "Not Yet",
    confirmLabel: "Confirm Pickup",
    loadingLabel: "Confirming pickup...",
    successParam: "picked_up",
    run: (orderId) => markOrderPickedUp(createSupabaseBrowserClient(), orderId),
  },
  picked_up: {
    title: "Start delivery?",
    description: "This marks the parcel as in transit to the drop location.",
    cancelLabel: "Not Yet",
    confirmLabel: "Start Delivery",
    loadingLabel: "Starting delivery...",
    successParam: "in_transit",
    run: (orderId) => markOrderInTransit(createSupabaseBrowserClient(), orderId),
  },
  in_transit: {
    title: "Mark this parcel as delivered?",
    description: "Confirm only after the item has been handed over at the destination.",
    cancelLabel: "Not Yet",
    confirmLabel: "Mark Delivered",
    loadingLabel: "Completing delivery...",
    successParam: "delivered",
    run: (orderId) => markOrderDelivered(createSupabaseBrowserClient(), orderId),
  },
};

export function JobLifecycleActions({ job }: JobLifecycleActionsProps) {
  const router = useRouter();
  const action = actionByStatus[job.status];
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (job.status === "delivered") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-sm font-bold text-[var(--success)]">
        Delivery Completed
      </div>
    );
  }

  if (job.status === "cancelled") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-bold text-[var(--danger)]">
        Pickup Cancelled
      </div>
    );
  }

  if (!action) {
    return null;
  }

  async function runAction() {
    if (!action) {
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error } = await action.run(job.id);

    if (error) {
      setLoading(false);
      setMessage(driverOrderErrorMessage(error));
      return;
    }

    router.replace(`${driverJobHref(job.id)}&${action.successParam}=1`);
  }

  if (confirming) {
    return (
      <div className="space-y-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <AuthError message={message} />
        <div>
          <h2 className="text-base font-bold text-[var(--brand-navy)]">{action.title}</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{action.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <AppButton
            type="button"
            variant="outline"
            onClick={() => setConfirming(false)}
            disabled={loading}
          >
            {action.cancelLabel}
          </AppButton>
          <AppButton type="button" onClick={runAction} disabled={loading}>
            {loading ? action.loadingLabel : action.confirmLabel}
          </AppButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AuthError message={message} />
      <AppButton
        type="button"
        className="w-full"
        onClick={() => {
          setMessage(null);
          setConfirming(true);
        }}
      >
        {job.status === "accepted" ? "Item Picked Up" : action.confirmLabel}
      </AppButton>
    </div>
  );
}
