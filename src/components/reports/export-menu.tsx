"use client";

import { DownloadIcon, FileSpreadsheetIcon, FileTextIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useExport, type ExportPayload } from "@/hooks/use-export";
import { useReportsStore } from "@/store/reports-store";

type ExportMenuProps = {
  payload: ExportPayload | null;
  disabled?: boolean;
};

export const ExportMenu = ({ payload, disabled }: ExportMenuProps) => {
  const { exportReport } = useExport();
  const { exporting } = useReportsStore();

  const handleExport = (format: "csv" | "pdf") => {
    if (!payload) {
      return;
    }
    void exportReport(format, payload);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" disabled={disabled || exporting || !payload} />
        }
      >
        <DownloadIcon data-icon="inline-start" />
        {exporting ? "Exporting…" : "Export"}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export report</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <FileSpreadsheetIcon />
          Download CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("pdf")}>
          <FileTextIcon />
          Download PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
