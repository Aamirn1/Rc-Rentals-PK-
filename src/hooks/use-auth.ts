"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

/** Fetches the current user on mount and syncs with the store. */
export function useAuth() {
  const user = useAppStore((s) => s.user);
  const authLoading = useAppStore((s) => s.authLoading);

  useEffect(() => {
    let active = true;
    const { setUser, setAuthLoading } = useAppStore.getState();
    setAuthLoading(true);
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((data) => {
        if (active) setUser(data.user || null);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setAuthLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { user, authLoading };
}
