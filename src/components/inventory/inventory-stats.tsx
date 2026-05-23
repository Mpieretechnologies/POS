"use client";

import { AlertTriangleIcon, PackageIcon, PackageXIcon, TrendingUpIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { InventoryStats as InventoryStatsData } from "@/types/product";
import { formatCurrency } from "@/utils/product-stock";

type InventoryStatsProps = {
  stats: InventoryStatsData;
  loading?: boolean;
};

const statCards = [
  {
    key: "totalProducts" as const,
    title: "Total Products",
    icon: PackageIcon,
    format: (value: number) => value.toString(),
  },
  {
    key: "lowStockCount" as const,
    title: "Low Stock",
    icon: AlertTriangleIcon,
    format: (value: number) => value.toString(),
    accent: "text-amber-600 dark:text-amber-400",
  },
  {
    key: "outOfStockCount" as const,
    title: "Out of Stock",
    icon: PackageXIcon,
    format: (value: number) => value.toString(),
    accent: "text-destructive",
  },
  {
    key: "totalInventoryValue" as const,
    title: "Inventory Value",
    icon: TrendingUpIcon,
    format: (value: number) => formatCurrency(value),
  },
];

export const InventoryStats = ({ stats, loading }: InventoryStatsProps) => {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statCards.map(({ key, title, icon: Icon, format, accent }) => (
        <Card key={key}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <Icon className={`size-4 ${accent ?? "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-semibold tracking-tight ${accent ?? ""}`}>
              {format(stats[key])}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
