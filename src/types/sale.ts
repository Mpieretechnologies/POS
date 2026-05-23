import type { Timestamp } from "firebase/firestore";
import type { DiscountType } from "@/types/cart";
import type { PaymentMethod } from "@/types/billing";

export type FirestoreSale = {
  employeeId: string;
  cashierName: string;
  invoiceNumber: string;
  subtotal: number;
  discount: number;
  discountType: DiscountType;
  discountValue: number;
  tax: number;
  finalTotal: number;
  paymentMethod: PaymentMethod;
  createdAt: Timestamp;
};

export type Sale = FirestoreSale & {
  id: string;
};

export type FirestoreSaleItem = {
  saleId: string;
  productId: string;
  productName: string;
  barcode: string;
  quantity: number;
  price: number;
  taxRate: number;
  total: number;
};

export type SaleItem = FirestoreSaleItem & {
  id: string;
};

export type SaleWithItems = {
  sale: Sale;
  items: SaleItem[];
};

export type CheckoutInput = {
  employeeId: string;
  cashierName: string;
};
