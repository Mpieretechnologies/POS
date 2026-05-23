import type { GstRate } from "@/types/billing";

export type CartItem = {
  productId: string;
  productName: string;
  barcode: string;
  price: number;
  quantity: number;
  taxRate: GstRate;
  subtotal: number;
  availableStock: number;
};

export type DiscountType = "flat" | "percentage";

export type CartDiscount = {
  type: DiscountType;
  value: number;
};
