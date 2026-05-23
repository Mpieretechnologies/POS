"use client";

import dynamic from "next/dynamic";
import { RefreshCwIcon } from "lucide-react";
import { RoleGate } from "@/components/auth/role-gate";
import { ChartSkeleton } from "@/components/charts/chart-skeleton";
import { BestSellingProducts } from "@/components/reports/best-selling-products";
import { DateRangeFilter } from "@/components/reports/date-range-filter";
import { EmptyReportState } from "@/components/reports/empty-report-state";
import { ExportMenu } from "@/components/reports/export-menu";
import { ReportErrorState } from "@/components/reports/report-error-state";
import { ReportSummary } from "@/components/reports/report-summary";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useProductSalesReport } from "@/hooks/use-product-sales-report";

const ProductPieChart = dynamic(
  () => import("@/components/charts/product-pie-chart").then((mod) => mod.ProductPieChart),
  { loading: () => <ChartSkeleton />, ssr: false },
);

export default function ProductReportPage() {
  const { appUser } = useAuth();
  const isAdmin = appUser?.role === "ADMIN";
  const employeeId = isAdmin ? undefined : appUser?.uid;
  const { report, loading, error, reload } = useProductSalesReport(employeeId);

  const exportPayload = report ? { type: "products" as const, report } : null;

  return (
    <RoleGate allow={["ADMIN", "CASHIER"]}>
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Reports</p>
            <h1 className="text-2xl font-semibold tracking-tight">Best-Selling Products</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Top products by quantity sold and revenue generated.
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
            <ReportSummary title="Product sales summary" summary={report.summary} />
            <div className="grid gap-6 xl:grid-cols-2">
              <ProductPieChart products={report.rows} />
              <BestSellingProducts products={report.rows} />
            </div>
          </>
        ) : !loading && !error ? (
          <EmptyReportState description="No product sales found for the selected date range." />
        ) : null}
      </div>
    </RoleGate>
  );
}
