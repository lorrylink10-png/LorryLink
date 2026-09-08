"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { AppButton } from "@/components/ui/AppButton";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    await auth.refreshAuth();
    router.replace("/login");
  }

  return (
    <AppButton type="button" variant="outline" className="w-full" onClick={handleLogout} disabled={loading}>
      <LogOut size={18} aria-hidden="true" />
      {loading ? "Logging out..." : "Log Out"}
    </AppButton>
  );
}

