import { Skeleton } from "@/components/ui/skeleton";

export const ChartSkeleton = () => (
  <Skeleton className="h-[320px] w-full rounded-xl" aria-busy="true" aria-label="Loading chart" />
);
