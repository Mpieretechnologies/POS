import { Timestamp, type DocumentData } from "firebase/firestore";
import type { FirestoreProduct, Product } from "@/types/product";
import { normalizeGstRate } from "@/utils/billing-calculations";

/** Firestore returns null for serverTimestamp fields until the write is acknowledged. */
const resolveTimestamp = (value: unknown): Timestamp | null => {
  if (value instanceof Timestamp) {
    return value;
  }
  if (value === null || value === undefined) {
    return Timestamp.now();
  }
  return null;
};

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

export const parseProduct = (id: string, data: DocumentData): Product | null => {
  if (
    !isString(data.productName) ||
    !isString(data.barcode) ||
    !isString(data.category) ||
    !isNumber(data.price) ||
    !isNumber(data.stock) ||
    !isNumber(data.minimumStock)
  ) {
    return null;
  }

  const createdAt = resolveTimestamp(data.createdAt);
  const updatedAt = resolveTimestamp(data.updatedAt);
  if (!createdAt || !updatedAt) {
    return null;
  }

  return {
    id,
    productName: data.productName,
    barcode: data.barcode,
    category: data.category,
    price: data.price,
    stock: data.stock,
    minimumStock: data.minimumStock,
    productImage: typeof data.productImage === "string" ? data.productImage : "",
    description: typeof data.description === "string" ? data.description : "",
    taxRate: normalizeGstRate(data.taxRate),
    createdAt,
    updatedAt,
  } satisfies Product;
};

export const toFirestoreProduct = (
  input: Omit<FirestoreProduct, "createdAt" | "updatedAt">,
  timestamps: Pick<FirestoreProduct, "createdAt" | "updatedAt">,
): FirestoreProduct => ({
  ...input,
  ...timestamps,
});
