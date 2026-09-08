"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthError } from "@/components/auth/AuthError";
import { AppButton } from "@/components/ui/AppButton";
import { cancelPickupOrder } from "@/lib/orders/customer";
import { customerOrderHref } from "@/lib/routing";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { PickupStatus } from "@/types/domain";

type CancelPickupButtonProps = {
  orderId: string;
  status: PickupStatus;
};

export function CancelPickupButton({ orderId, status }: CancelPickupButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const canCancel = status === "open" || status === "accepted";

  if (!canCancel) {
    return null;
  }

  async function handleCancel() {
    setLoading(true);
    setMessage(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await cancelPickupOrder(supabase, orderId);

    if (error) {
      setLoading(false);
      setMessage("Unable to cancel this pickup. It may already be in progress.");
      return;
    }

    router.replace(`${customerOrderHref(orderId)}&cancelled=1`);
  }

  if (confirming) {
    return (
      <div className="space-y-4 rounded-xl border border-red-200 bg-red-50 p-4">
        <AuthError message={message} />
        <div>
          <h2 className="text-base font-bold text-[var(--danger)]">Cancel this pickup?</h2>
          <p className="mt-1 text-sm leading-6 text-red-700">
            This will remove the pickup from active delivery requests.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <AppButton type="button" variant="outline" onClick={() => setConfirming(false)} disabled={loading}>
            Keep Pickup
          </AppButton>
          <AppButton type="button" variant="danger" onClick={handleCancel} disabled={loading}>
            {loading ? "Cancelling..." : "Cancel Pickup"}
          </AppButton>
        </div>
      </div>
    );
  }

  return (
    <AppButton type="button" variant="danger" className="w-full" onClick={() => setConfirming(true)}>
      Cancel Pickup
    </AppButton>
  );
}
