"use client";

import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

type DashboardLayoutShellProps = {
  children: ReactNode;
};

export const DashboardLayoutShell = ({ children }: DashboardLayoutShellProps) => {
  const pathname = usePathname();
  const isPosMode = pathname.startsWith("/dashboard/pos");

  useEffect(() => {
    if (!isPosMode) return;

    const html = document.documentElement;
    const { body } = document;
    html.classList.add("overflow-hidden");
    body.classList.add("overflow-hidden");

    return () => {
      html.classList.remove("overflow-hidden");
      body.classList.remove("overflow-hidden");
    };
  }, [isPosMode]);

  if (isPosMode) {
    return <div className="h-[100dvh] overflow-hidden bg-background">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      {children}
    </div>
  );
};
