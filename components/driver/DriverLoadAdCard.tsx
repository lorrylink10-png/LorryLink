"use client";

import { useState } from "react";
import { ArrowRight, CalendarDays, IndianRupee, Truck, Weight } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { closeDriverLoadAd, type DriverLoadAdWithLorry } from "@/lib/ads/driver";
import { formatCurrency, formatLorryDimensions, formatPostedTime, formatWeight } from "@/lib/orders/format";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type DriverLoadAdCardProps = {
  ad: DriverLoadAdWithLorry;
  onClosed: () => void;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function DriverLoadAdCard({ ad, onClosed }: DriverLoadAdCardProps) {
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isActive = ad.status === "active";

  async function handleClose() {
    if (!isActive || closing) {
      return;
    }

    setClosing(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error: closeError } = await closeDriverLoadAd(supabase, ad.id);

    if (closeError) {
      setClosing(false);
      setError("Unable to close this ad. Please try again.");
      return;
    }

    onClosed();
  }

  return (
    <AppCard className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-lg font-bold leading-tight text-[var(--brand-navy)]">
            <span className="truncate">{ad.from_pincode}</span>
            <ArrowRight size={17} className="shrink-0 text-[var(--brand-blue)]" aria-hidden="true" />
            <span className="truncate">{ad.to_pincode}</span>
          </div>
          <p className="mt-1 line-clamp-1 text-sm font-semibold text-[var(--text-secondary)]">
            {ad.from_address} to {ad.to_address}
          </p>
        </div>
        <StatusBadge tone={isActive ? "active" : "neutral"}>
          {ad.status.toUpperCase()}
        </StatusBadge>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-[var(--surface-subtle)] px-3 py-2 text-sm font-bold text-[var(--brand-navy)]">
          <CalendarDays size={16} className="text-[var(--text-secondary)]" aria-hidden="true" />
          {formatDate(ad.available_date)}
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-[var(--surface-subtle)] px-3 py-2 text-sm font-bold text-[var(--brand-navy)]">
          <Weight size={16} className="text-[var(--text-secondary)]" aria-hidden="true" />
          {formatWeight(ad.capacity_kg)}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[var(--text-secondary)]">
        <span className="inline-flex items-center gap-1">
          <Truck size={14} aria-hidden="true" />
          {ad.lorry
            ? `${ad.lorry.registration_number} - ${ad.lorry.vehicle_type}`
            : "Any available lorry"}
        </span>
        {ad.lorry ? (
          <span>{formatLorryDimensions(ad.lorry.length_ft, ad.lorry.width_ft)}</span>
        ) : null}
        {ad.expected_rate !== null ? (
          <span className="inline-flex items-center gap-1">
            <IndianRupee size={14} aria-hidden="true" />
            {formatCurrency(ad.expected_rate)}
          </span>
        ) : null}
      </div>

      {ad.notes ? (
        <p className="rounded-lg bg-orange-50 px-3 py-3 text-sm leading-6 text-[var(--brand-navy)]">
          {ad.notes}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-[var(--text-secondary)]">
          {formatPostedTime(ad.created_at)}
        </span>
        {isActive ? (
          <AppButton type="button" variant="outline" size="sm" onClick={handleClose} disabled={closing}>
            {closing ? "Closing..." : "Close Ad"}
          </AppButton>
        ) : null}
      </div>
      {error ? <p className="text-sm font-semibold text-[var(--danger)]">{error}</p> : null}
    </AppCard>
  );
}
