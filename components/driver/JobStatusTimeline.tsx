import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PickupStatus } from "@/types/domain";

type JobStatusTimelineProps = {
  status: PickupStatus;
};

const stages: Array<{
  status: PickupStatus;
  label: string;
}> = [
  { status: "accepted", label: "Accepted" },
  { status: "picked_up", label: "Picked Up" },
  { status: "in_transit", label: "In Transit" },
  { status: "delivered", label: "Delivered" },
];

export function JobStatusTimeline({ status }: JobStatusTimelineProps) {
  const currentIndex = stages.findIndex((stage) => stage.status === status);
  const cancelled = status === "cancelled";

  return (
    <div className="space-y-3">
      {stages.map((stage, index) => {
        const completed = !cancelled && currentIndex >= index;
        const current = !cancelled && currentIndex === index;

        return (
          <div key={stage.status} className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                completed
                  ? "border-[var(--brand-blue)] bg-[var(--brand-blue)] text-white"
                  : "border-[var(--border)] bg-white text-[var(--text-secondary)]",
              )}
            >
              {completed ? <CheckCircle2 size={17} aria-hidden="true" /> : <Circle size={13} aria-hidden="true" />}
            </span>
            <div className="min-w-0">
              <p
                className={cn(
                  "text-sm font-bold",
                  current || completed ? "text-[var(--brand-navy)]" : "text-[var(--text-secondary)]",
                )}
              >
                {stage.label}
              </p>
              {current ? (
                <p className="text-xs font-semibold text-[var(--brand-blue)]">Current stage</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
