"use client";

import { useMemo, useState } from "react";
import { Megaphone } from "lucide-react";
import { DriverLoadAdCard } from "@/components/driver/DriverLoadAdCard";
import { AppButton } from "@/components/ui/AppButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import type { DriverLoadAdWithLorry } from "@/lib/ads/driver";

type AdTab = "active" | "closed";

type DriverLoadAdsListProps = {
  ads: DriverLoadAdWithLorry[];
  onRefresh: () => void;
};

const tabLabels: Record<AdTab, string> = {
  active: "Active",
  closed: "Closed",
};

export function DriverLoadAdsList({ ads, onRefresh }: DriverLoadAdsListProps) {
  const [activeTab, setActiveTab] = useState<AdTab>("active");
  const visibleAds = useMemo(
    () => ads.filter((ad) => ad.status === activeTab),
    [activeTab, ads],
  );

  if (!ads.length) {
    return (
      <EmptyState
        icon={Megaphone}
        title="No load ads yet"
        description="Post your available route so customers know your lorry is ready for loading."
        action={<AppButton href="/driver/ads/create">Post Load Ad</AppButton>}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-white p-1 shadow-[var(--shadow-card)]">
        {(Object.keys(tabLabels) as AdTab[]).map((tab) => (
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

      {visibleAds.length ? (
        <section className="space-y-3">
          {visibleAds.map((ad) => (
            <DriverLoadAdCard key={ad.id} ad={ad} onClosed={onRefresh} />
          ))}
        </section>
      ) : (
        <EmptyState
          icon={Megaphone}
          title={`No ${tabLabels[activeTab].toLowerCase()} ads`}
          description="Load ads in this status will appear here."
          className="py-7"
        />
      )}
    </div>
  );
}
