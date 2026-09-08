"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageLoading } from "@/components/pages/PageStates";

export function ClientRedirect({ href }: { href: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(href);
  }, [href, router]);

  return <PageLoading />;
}
