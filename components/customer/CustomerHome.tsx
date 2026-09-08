import Link from "next/link";
import { Clock, Package, Plus } from "lucide-react";
import { OrderCard } from "@/components/customer/OrderCard";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency, formatStatus, getStatusTone } from "@/lib/orders/format";
import { customerOrderHref } from "@/lib/routing";
import type { CustomerOrder } from "@/lib/orders/customer";

type CustomerHomeProps = {
  profileName?: string | null;
  activeOrder: CustomerOrder | null;
  recentOrders: CustomerOrder[];
};

function firstName(name?: string | null) {
  return name?.trim().split(/\s+/)[0] ?? "";
}

export function CustomerHome({ profileName, activeOrder, recentOrders }: CustomerHomeProps) {
  const name = firstName(profileName);

  return (
    <div className="space-y-5">
      <PageHeader title={name ? `Hello, ${name}` : "Hello"} description="Need to send something today?" />

      <AppCard className="overflow-hidden border-0 bg-[var(--brand-navy)] p-0 text-white">
        <div className="space-y-5 p-5">
          <div className="space-y-2">
            <StatusBadge tone="accent">Pickup ready</StatusBadge>
            <h2 className="text-xl font-bold leading-tight">Create a parcel request</h2>
            <p className="text-sm leading-6 text-blue-100">
              Post your parcel and find a lorry.
            </p>
          </div>
          <AppButton href="/customer/create" className="w-full">
            <Plus size={18} aria-hidden="true" />
            Create Pickup
          </AppButton>
        </div>
      </AppCard>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-[var(--brand-navy)]">Active Pickup</h2>
        {activeOrder ? (
          <Link href={customerOrderHref(activeOrder.id)} className="block">
            <AppCard className="space-y-3 transition hover:border-[var(--brand-blue)]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-bold text-[var(--brand-navy)]">
                    {activeOrder.pickup_pincode} -&gt; {activeOrder.drop_pincode}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-[var(--text-secondary)]">
                    {formatCurrency(activeOrder.budget)}
                  </p>
                </div>
                <StatusBadge tone={getStatusTone(activeOrder.status)}>
                  {formatStatus(activeOrder.status)}
                </StatusBadge>
              </div>
            </AppCard>
          </Link>
        ) : (
          <EmptyState
            icon={Clock}
            title="No active pickups yet"
            description="Create a pickup and active requests will appear here."
            className="py-6"
          />
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-[var(--brand-navy)]">Recent Orders</h2>
          <Link href="/customer/orders" className="text-sm font-bold text-[var(--brand-blue)]">
            View All
          </Link>
        </div>
        {recentOrders.length ? (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Package}
            title="No recent orders"
            description="Your latest pickups will appear here."
            className="py-6"
          />
        )}
      </section>
    </div>
  );
}

