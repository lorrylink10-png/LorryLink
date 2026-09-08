"use client";

import { useMemo, useState } from "react";
import { BriefcaseBusiness } from "lucide-react";
import { DriverJobCard } from "@/components/driver/DriverJobCard";
import { AppButton } from "@/components/ui/AppButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import type { DriverOrderWithLorry } from "@/lib/orders/driver";
import type { PickupStatus } from "@/types/domain";

type JobTab = "active" | "completed";

type DriverJobsTabsProps = {
  jobs: DriverOrderWithLorry[];
};

const tabLabels: Record<JobTab, string> = {
  active: "Active",
  completed: "Completed",
};

const activeStatuses: PickupStatus[] = ["accepted", "picked_up", "in_transit"];
const completedStatuses: PickupStatus[] = ["delivered", "cancelled"];

export function DriverJobsTabs({ jobs }: DriverJobsTabsProps) {
  const [activeTab, setActiveTab] = useState<JobTab>("active");
  const visibleJobs = useMemo(() => {
    if (activeTab === "active") {
      return jobs.filter((job) => activeStatuses.includes(job.status));
    }

    return jobs.filter((job) => completedStatuses.includes(job.status));
  }, [activeTab, jobs]);

  if (!jobs.length) {
    return (
      <EmptyState
        icon={BriefcaseBusiness}
        title="No jobs yet"
        description="Accept a pickup from Discover to get started."
        action={<AppButton href="/driver/discover">Browse Pickups</AppButton>}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-white p-1 shadow-[var(--shadow-card)]">
        {(Object.keys(tabLabels) as JobTab[]).map((tab) => (
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

      {visibleJobs.length ? (
        <section className="space-y-3">
          {visibleJobs.map((job) => (
            <DriverJobCard key={job.id} job={job} />
          ))}
        </section>
      ) : (
        <EmptyState
          icon={BriefcaseBusiness}
          title={`No ${tabLabels[activeTab].toLowerCase()} jobs`}
          description="Jobs in this status will appear here."
          className="py-7"
        />
      )}
    </div>
  );
}
