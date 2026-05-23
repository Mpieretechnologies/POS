import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  Timestamp,
  where,
  type DocumentData,
  type DocumentSnapshot,
  type Firestore,
  type QueryConstraint,
  type Unsubscribe,
} from "firebase/firestore";
import type { Sale, SaleItem } from "@/types/sale";
import type { DateRange, ReportDataset } from "@/types/reports";
import { normalizeGstRate } from "@/utils/billing-calculations";

export const SALES_COLLECTION = "sales";
export const SALE_ITEMS_COLLECTION = "saleItems";
export const SALES_PAGE_SIZE = 100;
const SALE_ID_BATCH_SIZE = 30;

const parseSale = (id: string, data: DocumentData): Sale | null => {
  if (
    typeof data.employeeId !== "string" ||
    typeof data.cashierName !== "string" ||
    typeof data.invoiceNumber !== "string" ||
    typeof data.subtotal !== "number" ||
    typeof data.discount !== "number" ||
    typeof data.tax !== "number" ||
    typeof data.finalTotal !== "number" ||
    typeof data.paymentMethod !== "string" ||
    !data.createdAt
  ) {
    return null;
  }

  return {
    id,
    employeeId: data.employeeId,
    cashierName: data.cashierName,
    invoiceNumber: data.invoiceNumber,
    subtotal: data.subtotal,
    discount: data.discount,
    discountType: data.discountType === "percentage" ? "percentage" : "flat",
    discountValue: typeof data.discountValue === "number" ? data.discountValue : 0,
    tax: data.tax,
    finalTotal: data.finalTotal,
    paymentMethod: data.paymentMethod as Sale["paymentMethod"],
    createdAt: data.createdAt,
  };
};

const parseSaleItem = (id: string, data: DocumentData): SaleItem | null => {
  if (
    typeof data.saleId !== "string" ||
    typeof data.productId !== "string" ||
    typeof data.quantity !== "number" ||
    typeof data.price !== "number" ||
    typeof data.total !== "number"
  ) {
    return null;
  }

  return {
    id,
    saleId: data.saleId,
    productId: data.productId,
    productName: typeof data.productName === "string" ? data.productName : "",
    barcode: typeof data.barcode === "string" ? data.barcode : "",
    quantity: data.quantity,
    price: data.price,
    taxRate: normalizeGstRate(data.taxRate),
    total: data.total,
  };
};

const buildSalesQueryConstraints = (
  range: DateRange,
  employeeId?: string,
): QueryConstraint[] => {
  const constraints: QueryConstraint[] = [
    where("createdAt", ">=", Timestamp.fromDate(range.start)),
    where("createdAt", "<=", Timestamp.fromDate(range.end)),
    orderBy("createdAt", "desc"),
  ];

  if (employeeId) {
    constraints.unshift(where("employeeId", "==", employeeId));
  }

  return constraints;
};

export type SalesPageResult = {
  sales: Sale[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
};

export const fetchSalesPage = async (
  db: Firestore,
  range: DateRange,
  options?: {
    employeeId?: string;
    pageSize?: number;
    lastDoc?: DocumentSnapshot | null;
  },
): Promise<SalesPageResult> => {
  const pageSize = options?.pageSize ?? SALES_PAGE_SIZE;
  const constraints = buildSalesQueryConstraints(range, options?.employeeId);

  if (options?.lastDoc) {
    constraints.push(startAfter(options.lastDoc));
  }

  constraints.push(limit(pageSize));

  const snapshot = await getDocs(query(collection(db, SALES_COLLECTION), ...constraints));
  const sales = snapshot.docs
    .map((docSnap) => parseSale(docSnap.id, docSnap.data()))
    .filter((sale): sale is Sale => sale !== null);

  const lastDoc = snapshot.docs.at(-1) ?? null;

  return {
    sales,
    lastDoc,
    hasMore: snapshot.docs.length === pageSize,
  };
};

export const fetchAllSalesInRange = async (
  db: Firestore,
  range: DateRange,
  employeeId?: string,
): Promise<Sale[]> => {
  const allSales: Sale[] = [];
  let lastDoc: DocumentSnapshot | null = null;
  let hasMore = true;

  while (hasMore) {
    const page = await fetchSalesPage(db, range, { employeeId, lastDoc });
    allSales.push(...page.sales);
    lastDoc = page.lastDoc;
    hasMore = page.hasMore;
  }

  return allSales;
};

const chunkArray = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

export const fetchSaleItemsBySaleIds = async (
  db: Firestore,
  saleIds: string[],
): Promise<SaleItem[]> => {
  if (saleIds.length === 0) {
    return [];
  }

  const batches = chunkArray(saleIds, SALE_ID_BATCH_SIZE);
  const items: SaleItem[] = [];

  for (const batch of batches) {
    const snapshot = await getDocs(
      query(collection(db, SALE_ITEMS_COLLECTION), where("saleId", "in", batch)),
    );

    for (const docSnap of snapshot.docs) {
      const item = parseSaleItem(docSnap.id, docSnap.data());
      if (item) {
        items.push(item);
      }
    }
  }

  return items;
};

export const fetchReportDataset = async (
  db: Firestore,
  range: DateRange,
  employeeId?: string,
): Promise<ReportDataset> => {
  const sales = await fetchAllSalesInRange(db, range, employeeId);
  const items = await fetchSaleItemsBySaleIds(
    db,
    sales.map((sale) => sale.id),
  );

  return { sales, items };
};

export const subscribeSalesInRange = (
  db: Firestore,
  range: DateRange,
  onData: (sales: Sale[]) => void,
  onError: (error: unknown) => void,
  options?: { employeeId?: string; pageSize?: number },
): Unsubscribe => {
  const pageSize = options?.pageSize ?? SALES_PAGE_SIZE;
  const constraints = buildSalesQueryConstraints(range, options?.employeeId);
  constraints.push(limit(pageSize));

  return onSnapshot(
    query(collection(db, SALES_COLLECTION), ...constraints),
    (snapshot) => {
      const sales = snapshot.docs
        .map((docSnap) => parseSale(docSnap.id, docSnap.data()))
        .filter((sale): sale is Sale => sale !== null);
      onData(sales);
    },
    onError,
  );
};
