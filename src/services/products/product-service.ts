import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
  type DocumentSnapshot,
  type Firestore,
  type QueryConstraint,
} from "firebase/firestore";
import { createInventoryLog } from "@/services/inventory/inventory-log-service";
import { parseProduct } from "@/services/products/product-parser";
import type { InventoryChangeType } from "@/types/inventory-log";
import type { Product, ProductFilters, ProductInput } from "@/types/product";
import { normalizeBarcode } from "@/utils/barcode";
import { isLowStock } from "@/utils/product-stock";

const PRODUCTS = "products";
export const PRODUCTS_PAGE_SIZE = 20;

export type FetchProductsResult = {
  products: Product[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
};

const sortProducts = (products: Product[], sortBy: ProductFilters["sortBy"]): Product[] => {
  const sorted = [...products];
  switch (sortBy) {
    case "name":
      sorted.sort((a, b) => a.productName.localeCompare(b.productName));
      break;
    case "stock-asc":
      sorted.sort((a, b) => a.stock - b.stock);
      break;
    case "stock-desc":
      sorted.sort((a, b) => b.stock - a.stock);
      break;
    case "latest":
    default:
      sorted.sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis());
      break;
  }
  return sorted;
};

const filterProducts = (products: Product[], filters: ProductFilters): Product[] => {
  const search = filters.search.trim().toLowerCase();
  const barcodeSearch = normalizeBarcode(filters.search);

  return products.filter((product) => {
    if (filters.category && product.category !== filters.category) {
      return false;
    }
    if (filters.lowStockOnly && !isLowStock(product.stock, product.minimumStock)) {
      return false;
    }
    if (search) {
      const matchesName = product.productName.toLowerCase().includes(search);
      const matchesBarcode =
        product.barcode.toLowerCase().includes(search) ||
        normalizeBarcode(product.barcode) === barcodeSearch;
      if (!matchesName && !matchesBarcode) {
        return false;
      }
    }
    return true;
  });
};

export const fetchProductsPage = async (
  db: Firestore,
  options: {
    pageSize?: number;
    lastDoc?: DocumentSnapshot | null;
    category?: string | null;
  } = {},
): Promise<FetchProductsResult> => {
  const pageSize = options.pageSize ?? PRODUCTS_PAGE_SIZE;
  const constraints: QueryConstraint[] = [orderBy("updatedAt", "desc")];

  if (options.category) {
    constraints.unshift(where("category", "==", options.category));
  }

  if (options.lastDoc) {
    constraints.push(startAfter(options.lastDoc));
  }

  constraints.push(limit(pageSize + 1));

  const snap = await getDocs(query(collection(db, PRODUCTS), ...constraints));
  const docs = snap.docs;
  const hasMore = docs.length > pageSize;
  const pageDocs = hasMore ? docs.slice(0, pageSize) : docs;

  const products = pageDocs
    .map((item) => parseProduct(item.id, item.data()))
    .filter((item): item is Product => item !== null);

  return {
    products,
    lastDoc: pageDocs.at(-1) ?? null,
    hasMore,
  };
};

export const fetchAllProducts = async (db: Firestore): Promise<Product[]> => {
  const snap = await getDocs(
    query(collection(db, PRODUCTS), orderBy("updatedAt", "desc")),
  );
  return snap.docs
    .map((item) => parseProduct(item.id, item.data()))
    .filter((item): item is Product => item !== null);
};

export const fetchFilteredProducts = async (
  db: Firestore,
  filters: ProductFilters,
): Promise<Product[]> => {
  const needsClientFilter =
    Boolean(filters.search.trim()) || filters.lowStockOnly || filters.sortBy !== "latest";

  if (filters.category && !needsClientFilter) {
    const snap = await getDocs(
      query(
        collection(db, PRODUCTS),
        where("category", "==", filters.category),
        orderBy("updatedAt", "desc"),
      ),
    );
    return snap.docs
      .map((item) => parseProduct(item.id, item.data()))
      .filter((item): item is Product => item !== null);
  }

  const products = await fetchAllProducts(db);
  const filtered = filterProducts(products, filters);
  return sortProducts(filtered, filters.sortBy);
};

export const fetchProductById = async (
  db: Firestore,
  id: string,
): Promise<Product | null> => {
  const snap = await getDoc(doc(db, PRODUCTS, id));
  if (!snap.exists()) {
    return null;
  }
  return parseProduct(snap.id, snap.data());
};

export const fetchProductByBarcode = async (
  db: Firestore,
  barcode: string,
): Promise<Product | null> => {
  const normalized = normalizeBarcode(barcode);
  const snap = await getDocs(
    query(collection(db, PRODUCTS), where("barcode", "==", normalized), limit(1)),
  );
  const first = snap.docs[0];
  if (!first) {
    return null;
  }
  return parseProduct(first.id, first.data());
};

export const createProduct = async (
  db: Firestore,
  input: ProductInput,
  userId: string,
): Promise<string> => {
  const ref = await addDoc(collection(db, PRODUCTS), {
    productName: input.productName,
    barcode: normalizeBarcode(input.barcode),
    category: input.category,
    price: input.price,
    stock: input.stock,
    minimumStock: input.minimumStock,
    productImage: input.productImage ?? "",
    description: input.description ?? "",
    taxRate: input.taxRate ?? 18,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  try {
    await createInventoryLog(db, {
      productId: ref.id,
      productName: input.productName,
      previousStock: 0,
      newStock: input.stock,
      changeType: "initial",
      changedBy: userId,
    });
  } catch {
    // Product was created; do not fail the whole flow if the audit log write is denied.
  }

  return ref.id;
};

export const patchProductFields = async (
  db: Firestore,
  id: string,
  fields: Partial<Pick<ProductInput, "productImage">>,
): Promise<void> => {
  const payload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (fields.productImage !== undefined) {
    payload.productImage = fields.productImage;
  }

  await updateDoc(doc(db, PRODUCTS, id), payload);
};

export const updateProduct = async (
  db: Firestore,
  id: string,
  input: Partial<ProductInput>,
  userId: string,
  existing?: Product,
): Promise<void> => {
  const current = existing ?? (await fetchProductById(db, id));
  if (!current) {
    throw new Error("Product not found.");
  }

  const nextStock = input.stock ?? current.stock;
  const payload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (input.productName !== undefined) payload.productName = input.productName;
  if (input.barcode !== undefined) payload.barcode = normalizeBarcode(input.barcode);
  if (input.category !== undefined) payload.category = input.category;
  if (input.price !== undefined) payload.price = input.price;
  if (input.stock !== undefined) payload.stock = input.stock;
  if (input.minimumStock !== undefined) payload.minimumStock = input.minimumStock;
  if (input.productImage !== undefined) payload.productImage = input.productImage;
  if (input.description !== undefined) payload.description = input.description;
  if (input.taxRate !== undefined) payload.taxRate = input.taxRate;

  await updateDoc(doc(db, PRODUCTS, id), payload);

  if (input.stock !== undefined && input.stock !== current.stock) {
    await createInventoryLog(db, {
      productId: id,
      productName: input.productName ?? current.productName,
      previousStock: current.stock,
      newStock: nextStock,
      changeType: "manual",
      changedBy: userId,
    });
  }
};

export const updateProductStock = async (
  db: Firestore,
  id: string,
  newStock: number,
  userId: string,
  changeType: InventoryChangeType = "manual",
): Promise<void> => {
  const current = await fetchProductById(db, id);
  if (!current) {
    throw new Error("Product not found.");
  }

  if (current.stock === newStock) {
    return;
  }

  await updateDoc(doc(db, PRODUCTS, id), {
    stock: newStock,
    updatedAt: serverTimestamp(),
  });

  await createInventoryLog(db, {
    productId: id,
    productName: current.productName,
    previousStock: current.stock,
    newStock,
    changeType,
    changedBy: userId,
  });
};

export const deleteProduct = async (db: Firestore, id: string): Promise<void> => {
  await deleteDoc(doc(db, PRODUCTS, id));
};

export { filterProducts, sortProducts };
