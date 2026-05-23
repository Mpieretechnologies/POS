import type { Sale, SaleItem } from "@/types/sale";

export const DATE_RANGE_PRESETS = [
  "today",
  "yesterday",
  "last7days",
  "last30days",
  "thisMonth",
  "custom",
] as const;

export type DateRangePreset = (typeof DATE_RANGE_PRESETS)[number];

export type DateRange = {
  preset: DateRangePreset;
  start: Date;
  end: Date;
};

export type SalesSummary = {
  totalRevenue: number;
  totalOrders: number;
  totalTax: number;
  averageOrderValue: number;
  totalDiscount: number;
};

export type DailySalesPoint = {
  date: string;
  label: string;
  revenue: number;
  orders: number;
};

export type MonthlySalesPoint = {
  month: string;
  label: string;
  revenue: number;
  orders: number;
};

export type ProductSalesRow = {
  rank: number;
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
};

export type EmployeeSalesRow = {
  rank: number;
  employeeId: string;
  employeeName: string;
  invoiceCount: number;
  revenue: number;
};

export type TransactionRow = {
  id: string;
  invoiceNumber: string;
  cashierName: string;
  paymentMethod: string;
  finalTotal: number;
  createdAt: Date;
};

export type DashboardAnalytics = {
  summary: SalesSummary;
  dailyRevenue: number;
  monthlyRevenue: number;
  growthPercentage: number;
  bestProduct: ProductSalesRow | null;
  topEmployee: EmployeeSalesRow | null;
  salesTrend: DailySalesPoint[];
  recentTransactions: TransactionRow[];
  productSales: ProductSalesRow[];
  employeeSales: EmployeeSalesRow[];
};

export type DailySalesReport = {
  range: DateRange;
  summary: SalesSummary;
  transactions: TransactionRow[];
};

export type MonthlySalesReport = {
  range: DateRange;
  summary: SalesSummary;
  growthPercentage: number;
  trend: MonthlySalesPoint[];
  dailyTrend: DailySalesPoint[];
};

export type ProductSalesReport = {
  range: DateRange;
  rows: ProductSalesRow[];
  summary: SalesSummary;
};

export type EmployeeSalesReport = {
  range: DateRange;
  rows: EmployeeSalesRow[];
  summary: SalesSummary;
};

export type ReportExportType = "sales" | "products" | "employees" | "daily" | "monthly";

export type ReportDataset = {
  sales: Sale[];
  items: SaleItem[];
};
