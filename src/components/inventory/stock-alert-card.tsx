"use client";

import Link from "next/link";
import { AlertTriangleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { InventoryStats as InventoryStatsData } from "@/types/product";

type StockAlertCardProps = {
  stats: InventoryStatsData;
  loading?: boolean;
};

export const StockAlertCard = ({ stats, loading }: StockAlertCardProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  const alertCount = stats.lowStockCount + stats.outOfStockCount;
  const hasAlerts = alertCount > 0;

  return (
    <Card className={hasAlerts ? "border-amber-500/40 bg-amber-500/5" : undefined}>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangleIcon className="size-4 text-amber-600 dark:text-amber-400" />
          Stock alerts
        </CardTitle>
        {hasAlerts ? (
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/dashboard/inventory?filter=low" />}
          >
            View all
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {hasAlerts ? (
          <Alert variant="destructive" className="border-amber-500/30 bg-amber-500/10 text-foreground">
            <AlertTitle>Attention needed</AlertTitle>
            <AlertDescription>
              {stats.lowStockCount} product{stats.lowStockCount === 1 ? "" : "s"} low on stock and{" "}
              {stats.outOfStockCount} out of stock. Restock soon to avoid lost sales.
            </AlertDescription>
          </Alert>
        ) : (
          <p className="text-sm text-muted-foreground">
            All products are above their minimum stock levels.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
