import { jsPDF } from "jspdf";
import { getStoreName } from "@/lib/store-config";
import type {
  DailySalesReport,
  EmployeeSalesReport,
  MonthlySalesReport,
  ProductSalesReport,
} from "@/types/reports";
import { formatCurrency } from "@/utils/currency";
import { formatDateTime } from "@/utils/date";
import { getPresetLabel } from "@/utils/date-range";

type PdfSection = {
  label: string;
  value: string;
};

const addHeader = (doc: jsPDF, title: string): void => {
  const storeName = getStoreName();
  doc.setFontSize(18);
  doc.text(storeName, 14, 18);
  doc.setFontSize(14);
  doc.text(title, 14, 28);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${formatDateTime(new Date())}`, 14, 36);
  doc.setTextColor(0);
};

const addSummaryRows = (doc: jsPDF, rows: PdfSection[], startY: number): number => {
  let y = startY;
  doc.setFontSize(11);

  for (const row of rows) {
    doc.text(`${row.label}:`, 14, y);
    doc.text(row.value, 80, y);
    y += 8;
  }

  return y + 4;
};

const addTable = (
  doc: jsPDF,
  headers: string[],
  rows: string[][],
  startY: number,
): number => {
  let y = startY;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  headers.forEach((header, index) => {
    doc.text(header, 14 + index * 45, y);
  });
  doc.setFont("helvetica", "normal");
  y += 6;

  for (const row of rows) {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }

    row.forEach((cell, index) => {
      doc.text(String(cell).slice(0, 24), 14 + index * 45, y);
    });
    y += 6;
  }

  return y;
};

const savePdf = (doc: jsPDF, filename: string): void => {
  doc.save(filename);
};

export const exportDailyReportPdf = (report: DailySalesReport): void => {
  const doc = new jsPDF();
  addHeader(doc, "Daily Sales Report");

  const y = addSummaryRows(doc, [
    { label: "Period", value: getPresetLabel(report.range.preset) },
    { label: "Total Revenue", value: formatCurrency(report.summary.totalRevenue) },
    { label: "Orders", value: String(report.summary.totalOrders) },
    { label: "Tax Collected", value: formatCurrency(report.summary.totalTax) },
    { label: "Average Order", value: formatCurrency(report.summary.averageOrderValue) },
  ], 46);

  addTable(
    doc,
    ["Invoice", "Cashier", "Payment", "Total"],
    report.transactions.slice(0, 30).map((row) => [
      row.invoiceNumber,
      row.cashierName,
      row.paymentMethod,
      formatCurrency(row.finalTotal),
    ]),
    y,
  );

  savePdf(doc, "daily-sales-report.pdf");
};

export const exportMonthlyReportPdf = (report: MonthlySalesReport): void => {
  const doc = new jsPDF();
  addHeader(doc, "Monthly Sales Report");

  const y = addSummaryRows(doc, [
    { label: "Period", value: getPresetLabel(report.range.preset) },
    { label: "Total Revenue", value: formatCurrency(report.summary.totalRevenue) },
    { label: "Orders", value: String(report.summary.totalOrders) },
    { label: "Growth", value: `${report.growthPercentage.toFixed(1)}%` },
  ], 46);

  addTable(
    doc,
    ["Month", "Revenue", "Orders"],
    report.trend.map((point) => [
      point.label,
      formatCurrency(point.revenue),
      String(point.orders),
    ]),
    y,
  );

  savePdf(doc, "monthly-sales-report.pdf");
};

export const exportProductReportPdf = (report: ProductSalesReport): void => {
  const doc = new jsPDF();
  addHeader(doc, "Best-Selling Products Report");

  addTable(
    doc,
    ["Rank", "Product", "Qty", "Revenue"],
    report.rows.slice(0, 25).map((row) => [
      String(row.rank),
      row.productName,
      String(row.quantitySold),
      formatCurrency(row.revenue),
    ]),
    46,
  );

  savePdf(doc, "product-sales-report.pdf");
};

export const exportEmployeeReportPdf = (report: EmployeeSalesReport): void => {
  const doc = new jsPDF();
  addHeader(doc, "Employee Sales Report");

  addTable(
    doc,
    ["Rank", "Employee", "Invoices", "Revenue"],
    report.rows.slice(0, 25).map((row) => [
      String(row.rank),
      row.employeeName,
      String(row.invoiceCount),
      formatCurrency(row.revenue),
    ]),
    46,
  );

  savePdf(doc, "employee-sales-report.pdf");
};
