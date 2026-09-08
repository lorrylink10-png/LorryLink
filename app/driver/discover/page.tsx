import { Suspense } from "react";
import { DriverDiscoverScreen } from "@/components/pages/DriverPages";
import { PageLoading } from "@/components/pages/PageStates";

export default function DriverDiscoverPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <DriverDiscoverScreen />
    </Suspense>
  );
}

