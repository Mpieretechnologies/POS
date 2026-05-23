"use client";

import dynamic from "next/dynamic";
import { RefreshCwIcon } from "lucide-react";
import { RoleGate } from "@/components/auth/role-gate";
import { ChartSkeleton } from "@/components/charts/chart-skeleton";
import { DateRangeFilter } from "@/components/reports/date-range-filter";
import { EmployeeSalesTable } from "@/components/reports/employee-sales-table";
import { EmptyReportState } from "@/components/reports/empty-report-state";
import { ExportMenu } from "@/components/reports/export-menu";
import { ReportErrorState } from "@/components/reports/report-error-state";
import { ReportSummary } from "@/components/reports/report-summary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployeeSalesReport } from "@/hooks/use-employee-sales-report";

const EmployeePerformanceChart = dynamic(
  () =>
    import("@/components/charts/employee-performance-chart").then(
      (mod) => mod.EmployeePerformanceChart,
    ),
  { loading: () => <ChartSkeleton />, ssr: false },
);

export default function EmployeeReportPage() {
  const { report, loading, error, reload } = useEmployeeSalesReport();

  const exportPayload = report ? { type: "employees" as const, report } : null;

  return (
    <RoleGate allow={["ADMIN"]}>
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Reports</p>
            <h1 className="text-2xl font-semibold tracking-tight">Employee Sales Report</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sales performance ranked by revenue and invoice count.
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
        ) : report && report.rows.length > 0 ? (
          <>
            <ReportSummary title="Store summary" summary={report.summary} />
            <EmployeePerformanceChart employees={report.rows} />
            <Card>
              <CardHeader>
                <CardTitle>Employee rankings</CardTitle>
              </CardHeader>
              <CardContent>
                <EmployeeSalesTable rows={report.rows} />
              </CardContent>
            </Card>
          </>
        ) : !loading && !error ? (
          <EmptyReportState description="No employee sales found for the selected date range." />
        ) : null}
      </div>
    </RoleGate>
  );
}
