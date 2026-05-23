"use client";

import dynamic from "next/dynamic";
import { RefreshCwIcon } from "lucide-react";
import { RoleGate } from "@/components/auth/role-gate";
import { ChartSkeleton } from "@/components/charts/chart-skeleton";
import { DateRangeFilter } from "@/components/reports/date-range-filter";
import { EmptyReportState } from "@/components/reports/empty-report-state";
import { ExportMenu } from "@/components/reports/export-menu";
import { RecentTransactionsTable } from "@/components/reports/recent-transactions-table";
import { ReportErrorState } from "@/components/reports/report-error-state";
import { ReportSummary } from "@/components/reports/report-summary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useDailyReport } from "@/hooks/use-daily-report";

const SalesChart = dynamic(
  () => import("@/components/charts/sales-chart").then((mod) => mod.SalesChart),
  { loading: () => <ChartSkeleton />, ssr: false },
);

export default function DailyReportPage() {
  const { appUser } = useAuth();
  const isAdmin = appUser?.role === "ADMIN";
  const employeeId = isAdmin ? undefined : appUser?.uid;
  const { report, loading, error, reload } = useDailyReport(employeeId);

  const exportPayload = report ? { type: "daily" as const, report } : null;

  return (
    <RoleGate allow={["ADMIN", "CASHIER"]}>
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Reports</p>
            <h1 className="text-2xl font-semibold tracking-tight">Daily Sales Report</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Revenue, orders, tax, and transaction details for the selected period.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void reload()}>
              <RefreshCwIcon data-icon="inline-start" />
              Refresh
            </Button>
            <ExportMenu payload={exportPayload} disabled={loading || !report} />
          </div>
        </header>

        <DateRangeFilter />

        {error ? <ReportErrorState message={error} onRetry={() => void reload()} /> : null}

        {loading ? (
          <>
            <Skeleton className="h-40 rounded-xl" />
            <ChartSkeleton />
          </>
        ) : report && report.summary.totalOrders > 0 ? (
          <>
            <ReportSummary title="Daily summary" summary={report.summary} />
            <SalesChart data={report.transactions.map((tx) => ({
              date: tx.createdAt.toISOString(),
              label: tx.createdAt.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
              revenue: tx.finalTotal,
              orders: 1,
            }))} title="Transaction revenue" />
            <Card>
              <CardHeader>
                <CardTitle>Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentTransactionsTable transactions={report.transactions} />
              </CardContent>
            </Card>
          </>
        ) : !loading && !error ? (
          <EmptyReportState />
        ) : null}
      </div>
    </RoleGate>
  );
}
