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
import { RevenueCards } from "@/components/reports/revenue-cards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useReports } from "@/hooks/use-reports";

const SalesChart = dynamic(
  () => import("@/components/charts/sales-chart").then((mod) => mod.SalesChart),
  { loading: () => <ChartSkeleton />, ssr: false },
);

const ProductPieChart = dynamic(
  () => import("@/components/charts/product-pie-chart").then((mod) => mod.ProductPieChart),
  { loading: () => <ChartSkeleton />, ssr: false },
);

const EmployeePerformanceChart = dynamic(
  () =>
    import("@/components/charts/employee-performance-chart").then(
      (mod) => mod.EmployeePerformanceChart,
    ),
  { loading: () => <ChartSkeleton />, ssr: false },
);

export const ReportsDashboard = () => {
  const { appUser, loading: authLoading } = useAuth();
  const isAdmin = appUser?.role === "ADMIN";
  const employeeId = isAdmin ? undefined : appUser?.uid;

  const { analytics, loading: reportsLoading, error, reload } = useReports({
    employeeId,
    enabled: !authLoading && Boolean(appUser),
  });

  const loading = authLoading || reportsLoading;

  const exportPayload =
    analytics && analytics.recentTransactions.length > 0
      ? { type: "sales" as const, transactions: analytics.recentTransactions }
      : null;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Phase 4</p>
          <h1 className="text-2xl font-semibold tracking-tight">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAdmin
              ? "Store-wide sales insights, trends, and exportable reports."
              : "Your sales performance and recent transactions."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => void reload()}>
            <RefreshCwIcon data-icon="inline-start" />
            Refresh
          </Button>
          <ExportMenu payload={exportPayload} disabled={loading || !analytics} />
        </div>
      </header>

      <DateRangeFilter />

      {error ? <ReportErrorState message={error} onRetry={() => void reload()} /> : null}

      <RevenueCards analytics={analytics} loading={loading} />

      {loading ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      ) : analytics && analytics.summary.totalOrders > 0 ? (
        <>
          <div className="grid gap-6 xl:grid-cols-2">
            <SalesChart data={analytics.salesTrend} />
            <ProductPieChart products={analytics.productSales} />
          </div>

          <RoleGate allow={["ADMIN"]} fallback={null}>
            <EmployeePerformanceChart employees={analytics.employeeSales} />
          </RoleGate>

          <Card>
            <CardHeader>
              <CardTitle>Recent transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentTransactionsTable transactions={analytics.recentTransactions} />
            </CardContent>
          </Card>
        </>
      ) : !loading && !error ? (
        <EmptyReportState />
      ) : null}
    </div>
  );
};
