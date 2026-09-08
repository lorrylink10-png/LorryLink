import { AlertCircle } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";

export function PageLoading() {
  return <LoadingState />;
}

export function PageError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      icon={AlertCircle}
      title="Unable to load"
      description={message}
      action={
        onRetry ? (
          <AppButton type="button" variant="outline" onClick={onRetry}>
            Try Again
          </AppButton>
        ) : null
      }
    />
  );
}
