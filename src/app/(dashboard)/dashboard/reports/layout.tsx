import type { ReactNode } from "react";
import { ReportsNav } from "@/components/reports/reports-nav";

export default function ReportsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6 md:p-10">
      <ReportsNav />
      {children}
    </div>
  );
}
