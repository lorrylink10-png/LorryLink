import { Suspense } from "react";
import { DriverLoadAdsScreen } from "@/components/pages/DriverPages";
import { PageLoading } from "@/components/pages/PageStates";

export default function DriverLoadAdsPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <DriverLoadAdsScreen />
    </Suspense>
  );
}
