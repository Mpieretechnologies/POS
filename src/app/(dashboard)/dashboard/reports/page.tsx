"use client";

import { RoleGate } from "@/components/auth/role-gate";
import { ReportsDashboard } from "@/components/reports/reports-dashboard";

export default function ReportsPage() {
  return (
    <RoleGate allow={["ADMIN", "CASHIER"]}>
      <ReportsDashboard />
    </RoleGate>
  );
}
