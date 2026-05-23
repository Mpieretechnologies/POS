import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  type DocumentData,
  type Firestore,
} from "firebase/firestore";
import type { Sale, SaleItem, SaleWithItems } from "@/types/sale";
import { normalizeGstRate } from "@/utils/billing-calculations";

const SALES = "sales";
const SALE_ITEMS = "saleItems";

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

export const fetchSaleById = async (
  db: Firestore,
  saleId: string,
): Promise<SaleWithItems | null> => {
  const saleSnap = await getDoc(doc(db, SALES, saleId));
  if (!saleSnap.exists()) {
    return null;
  }

  const sale = parseSale(saleSnap.id, saleSnap.data());
  if (!sale) {
    return null;
  }

  const itemsSnap = await getDocs(
    query(collection(db, SALE_ITEMS), where("saleId", "==", saleId)),
  );

  const items = itemsSnap.docs
    .map((item) => parseSaleItem(item.id, item.data()))
    .filter((item): item is SaleItem => item !== null);

  return { sale, items };
};
