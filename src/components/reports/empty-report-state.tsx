import { BarChart3Icon } from "lucide-react";

type EmptyReportStateProps = {
  title?: string;
  description?: string;
};

export const EmptyReportState = ({
  title = "No data available",
  description = "There are no sales records for the selected date range.",
}: EmptyReportStateProps) => (
  <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 p-8 text-center">
    <BarChart3Icon className="mb-3 size-10 text-muted-foreground/60" />
    <h3 className="text-base font-medium">{title}</h3>
    <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
  </div>
);
