"use client";

import { useMemo, useState } from "react";
import { Package } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { OrderCard } from "@/components/customer/OrderCard";
import { cn } from "@/lib/utils";
import type { CustomerOrder } from "@/lib/orders/customer";
import type { PickupStatus } from "@/types/domain";

type OrderTab = "active" | "completed" | "cancelled";

type OrdersTabsProps = {
  orders: CustomerOrder[];
};

const tabLabels: Record<OrderTab, string> = {
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};

const activeStatuses: PickupStatus[] = ["open", "accepted", "picked_up", "in_transit"];

export function OrdersTabs({ orders }: OrdersTabsProps) {
  const [activeTab, setActiveTab] = useState<OrderTab>("active");
  const visibleOrders = useMemo(() => {
    if (activeTab === "active") {
      return orders.filter((order) => activeStatuses.includes(order.status));
    }

    if (activeTab === "completed") {
      return orders.filter((order) => order.status === "delivered");
    }

    return orders.filter((order) => order.status === "cancelled");
  }, [activeTab, orders]);

  if (!orders.length) {
    return (
      <EmptyState
        icon={Package}
        title="No pickups yet"
        description="Create your first pickup and let drivers discover it."
        action={<AppButton href="/customer/create">Create Pickup</AppButton>}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 rounded-xl bg-white p-1 shadow-[var(--shadow-card)]">
        {(Object.keys(tabLabels) as OrderTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "min-h-10 rounded-lg px-2 text-sm font-bold transition",
              activeTab === tab
                ? "bg-[var(--brand-blue)] text-white"
                : "text-[var(--text-secondary)] hover:bg-blue-50 hover:text-[var(--brand-blue)]",
            )}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {visibleOrders.length ? (
        <section className="space-y-3">
          {visibleOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </section>
      ) : (
        <EmptyState
          icon={Package}
          title={`No ${tabLabels[activeTab].toLowerCase()} pickups`}
          description="Pickups in this status will appear here."
          className="py-7"
        />
      )}
    </div>
  );
}
