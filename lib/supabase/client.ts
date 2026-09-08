"use client";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

let browserClient: ReturnType<typeof createClient<Database>> | null = null;

function getSupabaseBrowserEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase browser environment variables.");
  }

  return { supabaseUrl, supabaseKey };
}

export function createSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const { supabaseUrl, supabaseKey } = getSupabaseBrowserEnv();

  browserClient = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  });
  return browserClient;
}
