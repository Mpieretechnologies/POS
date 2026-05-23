"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { exportOptionsSchema } from "@/schemas/reports";
import { useReportsStore } from "@/store/reports-store";
import type {
  DailySalesReport,
  EmployeeSalesReport,
  MonthlySalesReport,
  ProductSalesReport,
  ReportExportType,
} from "@/types/reports";
import {
  exportDailyReportCsv,
  exportEmployeeReportCsv,
  exportMonthlyReportCsv,
  exportProductReportCsv,
  exportTransactionsCsv,
} from "@/utils/export-csv";
import {
  exportDailyReportPdf,
  exportEmployeeReportPdf,
  exportMonthlyReportPdf,
  exportProductReportPdf,
} from "@/utils/export-pdf";

type ExportPayload =
  | { type: "daily"; report: DailySalesReport }
  | { type: "monthly"; report: MonthlySalesReport }
  | { type: "products"; report: ProductSalesReport }
  | { type: "employees"; report: EmployeeSalesReport }
  | { type: "sales"; transactions: DailySalesReport["transactions"] };

export const useExport = () => {
  const { setExporting } = useReportsStore();

  const exportReport = useCallback(
    async (format: "csv" | "pdf", payload: ExportPayload) => {
      const parsed = exportOptionsSchema.safeParse({
        reportType: payload.type,
        format,
        title: `${payload.type}-report`,
      });

      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message ?? "Invalid export options.");
        return;
      }

      setExporting(true);

      try {
        if (format === "csv") {
          switch (payload.type) {
            case "daily":
              exportDailyReportCsv(payload.report);
              break;
            case "monthly":
              exportMonthlyReportCsv(payload.report);
              break;
            case "products":
              exportProductReportCsv(payload.report);
              break;
            case "employees":
              exportEmployeeReportCsv(payload.report);
              break;
            case "sales":
              exportTransactionsCsv(payload.transactions);
              break;
          }
        } else {
          switch (payload.type) {
            case "daily":
              exportDailyReportPdf(payload.report);
              break;
            case "monthly":
              exportMonthlyReportPdf(payload.report);
              break;
            case "products":
              exportProductReportPdf(payload.report);
              break;
            case "employees":
              exportEmployeeReportPdf(payload.report);
              break;
            case "sales":
              toast.error("PDF export for transaction lists is available on the Daily report page.");
              return;
          }
        }

        toast.success(`${format.toUpperCase()} export started.`);
      } catch {
        toast.error("Export failed. Please try again.");
      } finally {
        setExporting(false);
      }
    },
    [setExporting],
  );

  return { exportReport };
};

export type { ExportPayload, ReportExportType };
