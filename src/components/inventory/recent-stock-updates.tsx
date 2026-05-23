"use client";

import { formatDistanceToNow } from "@/utils/date";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { InventoryLog } from "@/types/inventory-log";

type RecentStockUpdatesProps = {
  logs: InventoryLog[];
  loading?: boolean;
};

export const RecentStockUpdates = ({ logs, loading }: RecentStockUpdatesProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent stock updates</CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No stock updates yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {logs.map((log) => {
              const delta = log.newStock - log.previousStock;
              const deltaLabel = delta >= 0 ? `+${delta}` : `${delta}`;

              return (
                <li key={log.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{log.productName}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {log.changeType.replace("-", " ")} · {log.previousStock} → {log.newStock}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={`text-sm font-medium ${
                        delta < 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {deltaLabel}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(log.createdAt.toDate())}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
