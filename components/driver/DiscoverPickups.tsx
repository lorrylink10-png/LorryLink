"use client";

import { useMemo, useState } from "react";
import { Filter, PackageSearch } from "lucide-react";
import { PickupCard } from "@/components/driver/PickupCard";
import { AppButton } from "@/components/ui/AppButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { AppInput, FormField } from "@/components/ui/FormControls";
import { cn } from "@/lib/utils";
import type { DriverOrder } from "@/lib/orders/driver";

type DiscoverPickupsProps = {
  orders: DriverOrder[];
};

export function DiscoverPickups({ orders }: DiscoverPickupsProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pickupPin, setPickupPin] = useState("");
  const [dropPin, setDropPin] = useState("");

  const filteredOrders = useMemo(() => {
    const pickup = pickupPin.trim();
    const drop = dropPin.trim();

    return orders.filter((order) => {
      const pickupMatches = pickup ? order.pickup_pincode.includes(pickup) : true;
      const dropMatches = drop ? order.drop_pincode.includes(drop) : true;

      return pickupMatches && dropMatches;
    });
  }, [dropPin, orders, pickupPin]);

  const hasFilters = Boolean(pickupPin.trim() || dropPin.trim());

  function clearFilters() {
    setPickupPin("");
    setDropPin("");
  }

  if (!orders.length) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="No pickups available"
        description="New parcel requests will appear here when customers post them."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <AppButton
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-between",
            filtersOpen ? "border-[var(--brand-blue)] text-[var(--brand-blue)]" : "",
          )}
          onClick={() => setFiltersOpen((open) => !open)}
        >
          <span className="inline-flex items-center gap-2">
            <Filter size={17} aria-hidden="true" />
            Filter
          </span>
          <span className="text-xs font-bold text-[var(--text-secondary)]">
            {filteredOrders.length} shown
          </span>
        </AppButton>

        {filtersOpen ? (
          <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-card)]">
            <div className="grid gap-4">
              <FormField label="Pickup PIN">
                <AppInput
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="670702"
                  value={pickupPin}
                  onChange={(event) => setPickupPin(event.target.value.replace(/\D/g, ""))}
                />
              </FormField>
              <FormField label="Drop PIN">
                <AppInput
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="560001"
                  value={dropPin}
                  onChange={(event) => setDropPin(event.target.value.replace(/\D/g, ""))}
                />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <AppButton type="button" variant="outline" onClick={clearFilters} disabled={!hasFilters}>
                  Clear
                </AppButton>
                <AppButton type="button" onClick={() => setFiltersOpen(false)}>
                  Apply Filters
                </AppButton>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {filteredOrders.length ? (
        <section className="space-y-3">
          {filteredOrders.map((order) => (
            <PickupCard key={order.id} order={order} />
          ))}
        </section>
      ) : (
        <EmptyState
          icon={PackageSearch}
          title="No matching pickups"
          description="Try changing the pickup or drop PIN filters."
          className="py-7"
        />
      )}
    </div>
  );
}

