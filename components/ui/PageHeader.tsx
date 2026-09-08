import { ArrowLeft } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";

type PageHeaderProps = {
  title: string;
  description?: string;
  backHref?: string;
  action?: React.ReactNode;
};

export function PageHeader({ title, description, backHref, action }: PageHeaderProps) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          {backHref ? (
            <AppButton href={backHref} variant="ghost" size="sm" className="h-10 w-10 px-0" aria-label="Go back">
              <ArrowLeft size={19} aria-hidden="true" />
            </AppButton>
          ) : null}
          <h1 className="truncate text-2xl font-bold leading-tight text-[var(--brand-navy)]">
            {title}
          </h1>
        </div>
        {description ? (
          <p className="text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

