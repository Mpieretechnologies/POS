import { Suspense } from "react";
import { BillingScreen } from "@/components/billing/billing-screen";
import { Skeleton } from "@/components/ui/skeleton";

const PosFallback = () => (
  <div className="flex h-[100dvh] flex-col bg-zinc-950">
    <Skeleton className="h-14 w-full rounded-none" />
    <div className="flex flex-1 gap-4 p-4">
      <Skeleton className="flex-1 rounded-xl" />
      <Skeleton className="w-96 rounded-xl" />
    </div>
  </div>
);

export default function PosPage() {
  return (
    <Suspense fallback={<PosFallback />}>
      <BillingScreen variant="pos" />
    </Suspense>
  );
}
