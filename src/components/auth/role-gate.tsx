"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { UserRole } from "@/types/user";

type RoleGateProps = {
  allow: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
};

export const RoleGate = ({ allow, children, fallback }: RoleGateProps) => {
  const { appUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center" aria-busy="true">
        <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }

  if (!appUser || !allow.includes(appUser.role)) {
    // Do not use `??`: explicit `fallback={null}` must render nothing (e.g. hide an admin-only control).
    if (fallback !== undefined) {
      return fallback;
    }
    return (
      <Alert variant="destructive">
        <AlertDescription>You do not have access to this area.</AlertDescription>
      </Alert>
    );
  }

  return children;
};
