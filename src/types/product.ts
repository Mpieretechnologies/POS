import type { Timestamp } from "firebase/firestore";
import type { GstRate } from "@/types/billing";

export const PRODUCT_CATEGORIES = [
  "Electronics",
  "Clothing",
  "Food & Beverage",
  "Health & Beauty",
  "Home & Garden",
  "Other",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export type FirestoreProduct = {
  productName: string;
  barcode: string;
  category: string;
  price: number;
  stock: number;
  minimumStock: number;
  productImage: string;
  description: string;
  taxRate: GstRate;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type Product = FirestoreProduct & {
  id: string;
};

export type ProductInput = {
  productName: string;
  barcode: string;
  category: string;
  price: number;
  stock: number;
  minimumStock: number;
  productImage: string;
  description: string;
  taxRate?: GstRate;
};

export type ProductSortOption = "latest" | "name" | "stock-asc" | "stock-desc";

export type ProductFilters = {
  search: string;
  category: string | null;
  lowStockOnly: boolean;
  sortBy: ProductSortOption;
};

export type InventoryStats = {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalInventoryValue: number;
};
