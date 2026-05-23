import Papa from "papaparse";
import type {
  DailySalesReport,
  EmployeeSalesReport,
  EmployeeSalesRow,
  MonthlySalesReport,
  ProductSalesReport,
  ProductSalesRow,
  TransactionRow,
} from "@/types/reports";
import { formatCurrency } from "@/utils/currency";
import { formatDateTime } from "@/utils/date";

const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const exportCsv = (rows: Record<string, string | number>[], filename: string): void => {
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename);
};

export const exportTransactionsCsv = (
  transactions: TransactionRow[],
  filename = "sales-report.csv",
): void => {
  exportCsv(
    transactions.map((row) => ({
      Invoice: row.invoiceNumber,
      Cashier: row.cashierName,
      Payment: row.paymentMethod,
      Total: row.finalTotal,
      Date: formatDateTime(row.createdAt),
    })),
    filename,
  );
};

export const exportProductSalesCsv = (
  rows: ProductSalesRow[],
  filename = "product-sales-report.csv",
): void => {
  exportCsv(
    rows.map((row) => ({
      Rank: row.rank,
      Product: row.productName,
      "Quantity Sold": row.quantitySold,
      Revenue: row.revenue,
    })),
    filename,
  );
};

export const exportEmployeeSalesCsv = (
  rows: EmployeeSalesRow[],
  filename = "employee-sales-report.csv",
): void => {
  exportCsv(
    rows.map((row) => ({
      Rank: row.rank,
      Employee: row.employeeName,
      Invoices: row.invoiceCount,
      Revenue: row.revenue,
    })),
    filename,
  );
};

export const exportDailyReportCsv = (report: DailySalesReport): void => {
  exportTransactionsCsv(report.transactions, "daily-sales-report.csv");
};

export const exportMonthlyReportCsv = (report: MonthlySalesReport): void => {
  exportCsv(
    report.trend.map((point) => ({
      Month: point.label,
      Revenue: point.revenue,
      Orders: point.orders,
    })),
    "monthly-sales-report.csv",
  );
};

export const exportProductReportCsv = (report: ProductSalesReport): void => {
  exportProductSalesCsv(report.rows, "product-sales-report.csv");
};

export const exportEmployeeReportCsv = (report: EmployeeSalesReport): void => {
  exportEmployeeSalesCsv(report.rows, "employee-sales-report.csv");
};

export const formatCurrencyForExport = (amount: number): string => formatCurrency(amount);
