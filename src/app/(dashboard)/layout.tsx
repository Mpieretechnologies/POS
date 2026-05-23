import type { ReactNode } from "react";
import { DashboardAuthGate } from "@/components/auth/dashboard-auth-gate";
import { DashboardLayoutShell } from "@/components/dashboard/dashboard-layout-shell";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardAuthGate>
      <DashboardLayoutShell>{children}</DashboardLayoutShell>
    </DashboardAuthGate>
  );
}
