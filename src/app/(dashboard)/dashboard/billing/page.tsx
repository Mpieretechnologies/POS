import { Suspense } from "react";
import { BillingScreen } from "@/components/billing/billing-screen";
import { Skeleton } from "@/components/ui/skeleton";

const BillingFallback = () => (
  <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6 md:p-10">
    <Skeleton className="h-10 w-48" />
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <Skeleton className="h-96 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  </div>
);

export default function BillingPage() {
  return (
    <Suspense fallback={<BillingFallback />}>
      <BillingScreen />
    </Suspense>
  );
}
