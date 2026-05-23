import { Suspense } from "react";
import { InventoryDashboard } from "@/components/inventory/inventory-dashboard";
import { Skeleton } from "@/components/ui/skeleton";

const InventoryDashboardFallback = () => (
  <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6 md:p-10">
    <Skeleton className="h-10 w-64" />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-28 w-full" />
      ))}
    </div>
    <Skeleton className="h-96 w-full" />
  </div>
);

export default function InventoryPage() {
  return (
    <Suspense fallback={<InventoryDashboardFallback />}>
      <InventoryDashboard />
    </Suspense>
  );
}
