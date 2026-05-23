import type { Sale, SaleItem } from "@/types/sale";
import type {
  DailySalesPoint,
  DashboardAnalytics,
  DateRange,
  EmployeeSalesRow,
  MonthlySalesPoint,
  ProductSalesRow,
  SalesSummary,
  TransactionRow,
} from "@/types/reports";
import {
  eachDayInRange,
  formatChartDayLabel,
  formatChartMonthLabel,
  formatDateKey,
  formatMonthKey,
  toFirestoreDate,
} from "@/utils/date-range";
import { roundMoney } from "@/utils/currency";

export const calculateSalesSummary = (sales: Sale[]): SalesSummary => {
  if (sales.length === 0) {
    return {
      totalRevenue: 0,
      totalOrders: 0,
      totalTax: 0,
      averageOrderValue: 0,
      totalDiscount: 0,
    };
  }

  const totalRevenue = roundMoney(sales.reduce((sum, sale) => sum + sale.finalTotal, 0));
  const totalTax = roundMoney(sales.reduce((sum, sale) => sum + sale.tax, 0));
  const totalDiscount = roundMoney(sales.reduce((sum, sale) => sum + sale.discount, 0));
  const totalOrders = sales.length;
  const averageOrderValue = roundMoney(totalRevenue / totalOrders);

  return {
    totalRevenue,
    totalOrders,
    totalTax,
    averageOrderValue,
    totalDiscount,
  };
};

export const calculateGrowthPercentage = (current: number, previous: number): number => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return roundMoney(((current - previous) / previous) * 100);
};

export const toTransactionRows = (sales: Sale[]): TransactionRow[] => {
  const rows: TransactionRow[] = [];

  for (const sale of sales) {
    const createdAt = toFirestoreDate(sale.createdAt);
    if (!createdAt) {
      continue;
    }

    rows.push({
      id: sale.id,
      invoiceNumber: sale.invoiceNumber,
      cashierName: sale.cashierName,
      paymentMethod: sale.paymentMethod,
      finalTotal: sale.finalTotal,
      createdAt,
    });
  }

  return rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const aggregateDailySales = (sales: Sale[], range: DateRange): DailySalesPoint[] => {
  const buckets = new Map<string, { revenue: number; orders: number }>();

  for (const day of eachDayInRange(range)) {
    buckets.set(day, { revenue: 0, orders: 0 });
  }

  for (const sale of sales) {
    const createdAt = toFirestoreDate(sale.createdAt);
    if (!createdAt) {
      continue;
    }

    const key = formatDateKey(createdAt);
    const bucket = buckets.get(key);
    if (!bucket) {
      continue;
    }

    bucket.revenue = roundMoney(bucket.revenue + sale.finalTotal);
    bucket.orders += 1;
  }

  return Array.from(buckets.entries()).map(([date, value]) => ({
    date,
    label: formatChartDayLabel(date),
    revenue: value.revenue,
    orders: value.orders,
  }));
};

export const aggregateMonthlySales = (sales: Sale[]): MonthlySalesPoint[] => {
  const buckets = new Map<string, { revenue: number; orders: number }>();

  for (const sale of sales) {
    const createdAt = toFirestoreDate(sale.createdAt);
    if (!createdAt) {
      continue;
    }

    const key = formatMonthKey(createdAt);
    const bucket = buckets.get(key) ?? { revenue: 0, orders: 0 };
    bucket.revenue = roundMoney(bucket.revenue + sale.finalTotal);
    bucket.orders += 1;
    buckets.set(key, bucket);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, value]) => ({
      month,
      label: formatChartMonthLabel(month),
      revenue: value.revenue,
      orders: value.orders,
    }));
};

export const aggregateProductSales = (items: SaleItem[]): ProductSalesRow[] => {
  const buckets = new Map<
    string,
    { productName: string; quantitySold: number; revenue: number }
  >();

  for (const item of items) {
    const bucket = buckets.get(item.productId) ?? {
      productName: item.productName,
      quantitySold: 0,
      revenue: 0,
    };

    bucket.productName = item.productName || bucket.productName;
    bucket.quantitySold += item.quantity;
    bucket.revenue = roundMoney(bucket.revenue + item.total);
    buckets.set(item.productId, bucket);
  }

  return Array.from(buckets.entries())
    .map(([productId, value]) => ({
      productId,
      productName: value.productName,
      quantitySold: value.quantitySold,
      revenue: value.revenue,
      rank: 0,
    }))
    .sort((a, b) => b.revenue - a.revenue || b.quantitySold - a.quantitySold)
    .map((row, index) => ({ ...row, rank: index + 1 }));
};

export const aggregateEmployeeSales = (sales: Sale[]): EmployeeSalesRow[] => {
  const buckets = new Map<
    string,
    { employeeName: string; invoiceCount: number; revenue: number }
  >();

  for (const sale of sales) {
    const bucket = buckets.get(sale.employeeId) ?? {
      employeeName: sale.cashierName,
      invoiceCount: 0,
      revenue: 0,
    };

    bucket.employeeName = sale.cashierName || bucket.employeeName;
    bucket.invoiceCount += 1;
    bucket.revenue = roundMoney(bucket.revenue + sale.finalTotal);
    buckets.set(sale.employeeId, bucket);
  }

  return Array.from(buckets.entries())
    .map(([employeeId, value]) => ({
      employeeId,
      employeeName: value.employeeName,
      invoiceCount: value.invoiceCount,
      revenue: value.revenue,
      rank: 0,
    }))
    .sort((a, b) => b.revenue - a.revenue || b.invoiceCount - a.invoiceCount)
    .map((row, index) => ({ ...row, rank: index + 1 }));
};

export const buildDashboardAnalytics = (
  sales: Sale[],
  items: SaleItem[],
  range: DateRange,
  previousPeriodSales: Sale[],
): DashboardAnalytics => {
  const summary = calculateSalesSummary(sales);
  const previousSummary = calculateSalesSummary(previousPeriodSales);
  const salesTrend = aggregateDailySales(sales, range);
  const productSales = aggregateProductSales(items);
  const employeeSales = aggregateEmployeeSales(sales);
  const recentTransactions = toTransactionRows(sales).slice(0, 10);

  const todayKey = formatDateKey(new Date());
  const monthKey = formatMonthKey(new Date());

  const dailyRevenue = roundMoney(
    sales
      .filter((sale) => {
        const createdAt = toFirestoreDate(sale.createdAt);
        return createdAt ? formatDateKey(createdAt) === todayKey : false;
      })
      .reduce((sum, sale) => sum + sale.finalTotal, 0),
  );

  const monthlyRevenue = roundMoney(
    sales
      .filter((sale) => {
        const createdAt = toFirestoreDate(sale.createdAt);
        return createdAt ? formatMonthKey(createdAt) === monthKey : false;
      })
      .reduce((sum, sale) => sum + sale.finalTotal, 0),
  );

  return {
    summary,
    dailyRevenue,
    monthlyRevenue,
    growthPercentage: calculateGrowthPercentage(summary.totalRevenue, previousSummary.totalRevenue),
    bestProduct: productSales[0] ?? null,
    topEmployee: employeeSales[0] ?? null,
    salesTrend,
    recentTransactions,
    productSales: productSales.slice(0, 5),
    employeeSales: employeeSales.slice(0, 5),
  };
};
