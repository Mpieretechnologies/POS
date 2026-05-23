"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SalesSummary } from "@/types/reports";
import { formatCurrency } from "@/utils/currency";

type ReportSummaryProps = {
  title?: string;
  summary: SalesSummary;
  growthPercentage?: number;
};

export const ReportSummary = ({
  title = "Summary",
  summary,
  growthPercentage,
}: ReportSummaryProps) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-sm text-muted-foreground">Total revenue</dt>
          <dd className="text-2xl font-semibold">{formatCurrency(summary.totalRevenue)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Orders</dt>
          <dd className="text-2xl font-semibold">{summary.totalOrders}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Tax collected</dt>
          <dd className="text-2xl font-semibold">{formatCurrency(summary.totalTax)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Average order</dt>
          <dd className="text-2xl font-semibold">{formatCurrency(summary.averageOrderValue)}</dd>
        </div>
        {typeof growthPercentage === "number" ? (
          <div className="sm:col-span-2 lg:col-span-4">
            <dt className="text-sm text-muted-foreground">Growth vs previous period</dt>
            <dd className="text-lg font-semibold">
              {growthPercentage >= 0 ? "+" : ""}
              {growthPercentage.toFixed(1)}%
            </dd>
          </div>
        ) : null}
      </dl>
    </CardContent>
  </Card>
);
