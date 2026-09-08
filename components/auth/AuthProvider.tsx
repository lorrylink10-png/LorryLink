"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getUserDestination, type AuthRoutingState } from "@/lib/auth/destination";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthContextValue = AuthRoutingState & {
  loading: boolean;
  offline: boolean;
  error: string | null;
  refreshAuth: () => Promise<AuthRoutingState>;
};

const emptyState: AuthRoutingState = {
  user: null,
  profile: null,
  driverProfile: null,
  firstLorry: null,
  isDriverOnboardingComplete: false,
  destination: "/login",
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthRoutingState>(emptyState);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshAuth = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();

    if (!navigator.onLine) {
      setOffline(true);
      setError("Lorry Link needs an internet connection to load your account and delivery information.");
      setLoading(false);
      return emptyState;
    }

    setOffline(false);

    try {
      const nextState = await getUserDestination(supabase);
      setState(nextState);
      setError(null);
      return nextState;
    } catch {
      const nextState = { ...emptyState };
      setState(nextState);
      setError("Unable to load your account. Please check your connection and try again.");
      return nextState;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshAuth();
    }, 0);

    const supabase = createSupabaseBrowserClient();
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setState(emptyState);
        setLoading(false);
        return;
      }

      void refreshAuth();
    });

    const handleOnline = () => {
      setOffline(false);
      void refreshAuth();
    };
    const handleOffline = () => setOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.clearTimeout(timer);
      data.subscription.unsubscribe();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [refreshAuth]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      loading,
      offline,
      error,
      refreshAuth,
    }),
    [error, loading, offline, refreshAuth, state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return value;
}

export function useAuthenticatedUser(): User | null {
  return useAuth().user;
}
