"use client";

import dynamic from "next/dynamic";
import { RefreshCwIcon } from "lucide-react";
import { RoleGate } from "@/components/auth/role-gate";
import { ChartSkeleton } from "@/components/charts/chart-skeleton";
import { DateRangeFilter } from "@/components/reports/date-range-filter";
import { EmptyReportState } from "@/components/reports/empty-report-state";
import { ExportMenu } from "@/components/reports/export-menu";
import { ReportErrorState } from "@/components/reports/report-error-state";
import { ReportSummary } from "@/components/reports/report-summary";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useMonthlyReport } from "@/hooks/use-monthly-report";

const RevenueTrendChart = dynamic(
  () =>
    import("@/components/charts/revenue-trend-chart").then((mod) => mod.RevenueTrendChart),
  { loading: () => <ChartSkeleton />, ssr: false },
);

const SalesChart = dynamic(
  () => import("@/components/charts/sales-chart").then((mod) => mod.SalesChart),
  { loading: () => <ChartSkeleton />, ssr: false },
);

export default function MonthlyReportPage() {
  const { appUser } = useAuth();
  const isAdmin = appUser?.role === "ADMIN";
  const employeeId = isAdmin ? undefined : appUser?.uid;
  const { report, loading, error, reload } = useMonthlyReport(employeeId);

  const exportPayload = report ? { type: "monthly" as const, report } : null;

  return (
    <RoleGate allow={["ADMIN", "CASHIER"]}>
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Reports</p>
            <h1 className="text-2xl font-semibold tracking-tight">Monthly Sales Report</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Monthly revenue, order volume, and growth trends.
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
            <ReportSummary
              title="Monthly summary"
              summary={report.summary}
              growthPercentage={report.growthPercentage}
            />
            <div className="grid gap-6 xl:grid-cols-2">
              <RevenueTrendChart
                data={report.trend}
                title="Monthly revenue"
                dataKey="month"
              />
              <SalesChart data={report.dailyTrend} title="Daily breakdown" />
            </div>
          </>
        ) : !loading && !error ? (
          <EmptyReportState />
        ) : null}
      </div>
    </RoleGate>
  );
}
