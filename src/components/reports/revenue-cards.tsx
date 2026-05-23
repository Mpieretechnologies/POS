"use client";

import {
  IndianRupeeIcon,
  ReceiptIcon,
  ShoppingBagIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardAnalytics } from "@/types/reports";
import { formatCurrency } from "@/utils/currency";

type RevenueCardsProps = {
  analytics: DashboardAnalytics | null;
  loading?: boolean;
};

const metricCards = (
  analytics: DashboardAnalytics,
): {
  title: string;
  value: string;
  description: string;
  icon: typeof IndianRupeeIcon;
}[] => [
  {
    title: "Total Revenue",
    value: formatCurrency(analytics.summary.totalRevenue),
    description: `${analytics.summary.totalOrders} orders in range`,
    icon: IndianRupeeIcon,
  },
  {
    title: "Daily Sales",
    value: formatCurrency(analytics.dailyRevenue),
    description: "Revenue today",
    icon: ReceiptIcon,
  },
  {
    title: "Monthly Sales",
    value: formatCurrency(analytics.monthlyRevenue),
    description: `${analytics.growthPercentage >= 0 ? "+" : ""}${analytics.growthPercentage.toFixed(1)}% vs previous period`,
    icon: TrendingUpIcon,
  },
  {
    title: "Best Seller",
    value: analytics.bestProduct?.productName ?? "—",
    description: analytics.bestProduct
      ? `${analytics.bestProduct.quantitySold} units · ${formatCurrency(analytics.bestProduct.revenue)}`
      : "No product sales yet",
    icon: ShoppingBagIcon,
  },
  {
    title: "Top Employee",
    value: analytics.topEmployee?.employeeName ?? "—",
    description: analytics.topEmployee
      ? `${analytics.topEmployee.invoiceCount} invoices · ${formatCurrency(analytics.topEmployee.revenue)}`
      : "No employee sales yet",
    icon: UsersIcon,
  },
];

export const RevenueCards = ({ analytics, loading }: RevenueCardsProps) => {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {metricCards(analytics).map(({ title, value, description, icon: Icon }) => (
        <Card key={title}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="truncate text-xl font-semibold">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export const AnalyticsCards = RevenueCards;
