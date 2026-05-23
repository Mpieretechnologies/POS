"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";

export const DashboardAuthGate = ({ children }: { children: ReactNode }) => {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) {
      return;
    }
    if (!firebaseUser) {
      const from =
        pathname && pathname.startsWith("/") && !pathname.startsWith("//")
          ? pathname
          : "/dashboard";
      router.replace(`/login?from=${encodeURIComponent(from)}`);
    }
  }, [firebaseUser, loading, pathname, router]);

  if (loading || !firebaseUser) {
    return (
      <div
        className="flex min-h-[50vh] items-center justify-center"
        role="status"
        aria-busy="true"
        aria-label="Loading account"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="size-9 animate-spin rounded-full border-2 border-muted border-t-primary" />
          <p className="text-sm text-muted-foreground">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  return children;
};
