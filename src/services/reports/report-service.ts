import type { Firestore } from "firebase/firestore";
import type {
  DailySalesReport,
  DashboardAnalytics,
  DateRange,
  EmployeeSalesReport,
  MonthlySalesReport,
  ProductSalesReport,
} from "@/types/reports";
import { getPreviousPeriodRange } from "@/utils/date-range";
import {
  aggregateDailySales,
  aggregateEmployeeSales,
  aggregateMonthlySales,
  aggregateProductSales,
  buildDashboardAnalytics,
  calculateGrowthPercentage,
  calculateSalesSummary,
  toTransactionRows,
} from "@/utils/report-aggregations";
import {
  fetchReportDataset,
  fetchSaleItemsBySaleIds,
  fetchAllSalesInRange,
} from "@/services/reports/sales-query-service";

export const getDashboardAnalytics = async (
  db: Firestore,
  range: DateRange,
  employeeId?: string,
): Promise<DashboardAnalytics> => {
  const previousRange = getPreviousPeriodRange(range);
  const [currentDataset, previousSales] = await Promise.all([
    fetchReportDataset(db, range, employeeId),
    fetchAllSalesInRange(db, previousRange, employeeId),
  ]);

  return buildDashboardAnalytics(
    currentDataset.sales,
    currentDataset.items,
    range,
    previousSales,
  );
};

export const getDailySalesReport = async (
  db: Firestore,
  range: DateRange,
  employeeId?: string,
): Promise<DailySalesReport> => {
  const sales = await fetchAllSalesInRange(db, range, employeeId);

  return {
    range,
    summary: calculateSalesSummary(sales),
    transactions: toTransactionRows(sales),
  };
};

export const getMonthlySalesReport = async (
  db: Firestore,
  range: DateRange,
  employeeId?: string,
): Promise<MonthlySalesReport> => {
  const previousRange = getPreviousPeriodRange(range);
  const [sales, previousSales] = await Promise.all([
    fetchAllSalesInRange(db, range, employeeId),
    fetchAllSalesInRange(db, previousRange, employeeId),
  ]);

  const summary = calculateSalesSummary(sales);
  const previousSummary = calculateSalesSummary(previousSales);

  return {
    range,
    summary,
    growthPercentage: calculateGrowthPercentage(
      summary.totalRevenue,
      previousSummary.totalRevenue,
    ),
    trend: aggregateMonthlySales(sales),
    dailyTrend: aggregateDailySales(sales, range),
  };
};

export const getProductSalesReport = async (
  db: Firestore,
  range: DateRange,
  employeeId?: string,
): Promise<ProductSalesReport> => {
  const sales = await fetchAllSalesInRange(db, range, employeeId);
  const items = await fetchSaleItemsBySaleIds(
    db,
    sales.map((sale) => sale.id),
  );

  return {
    range,
    rows: aggregateProductSales(items),
    summary: calculateSalesSummary(sales),
  };
};

export const getEmployeeSalesReport = async (
  db: Firestore,
  range: DateRange,
): Promise<EmployeeSalesReport> => {
  const sales = await fetchAllSalesInRange(db, range);

  return {
    range,
    rows: aggregateEmployeeSales(sales),
    summary: calculateSalesSummary(sales),
  };
};

export const buildAnalyticsFromDataset = (
  sales: import("@/types/sale").Sale[],
  items: import("@/types/sale").SaleItem[],
  range: DateRange,
  previousPeriodSales: import("@/types/sale").Sale[],
): DashboardAnalytics =>
  buildDashboardAnalytics(sales, items, range, previousPeriodSales);
