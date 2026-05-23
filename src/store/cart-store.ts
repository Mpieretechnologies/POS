import { create } from "zustand";
import type { BillingTotals } from "@/types/billing";
import type { CartDiscount, CartItem } from "@/types/cart";
import type { Product } from "@/types/product";
import {
  calculateBillingTotals,
  calculateLineSubtotal,
  normalizeGstRate,
} from "@/utils/billing-calculations";
import { normalizeBarcode } from "@/utils/barcode";

type CartStore = {
  items: CartItem[];
  discount: CartDiscount | null;
  checkoutLoading: boolean;
  lastInvoiceId: string | null;
  totals: BillingTotals;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setDiscount: (discount: CartDiscount | null) => void;
  clearCart: () => void;
  setCheckoutLoading: (loading: boolean) => void;
  setLastInvoiceId: (id: string | null) => void;
  getItem: (productId: string) => CartItem | undefined;
};

const recalculateTotals = (
  items: CartItem[],
  discount: CartDiscount | null,
): BillingTotals => calculateBillingTotals(items, discount);

const buildCartItem = (product: Product, quantity: number): CartItem => ({
  productId: product.id,
  productName: product.productName,
  barcode: product.barcode,
  price: product.price,
  quantity,
  taxRate: normalizeGstRate(product.taxRate),
  subtotal: calculateLineSubtotal(product.price, quantity),
  availableStock: product.stock,
});

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  discount: null,
  checkoutLoading: false,
  lastInvoiceId: null,
  totals: recalculateTotals([], null),

  addToCart: (product, quantity = 1) => {
    if (product.stock <= 0) {
      return;
    }

    const qty = Math.min(Math.max(1, quantity), product.stock);
    const { items, discount } = get();
    const existing = items.find((item) => item.productId === product.id);

    let nextItems: CartItem[];

    if (existing) {
      const newQty = Math.min(existing.quantity + qty, product.stock);
      nextItems = items.map((item) =>
        item.productId === product.id
          ? {
              ...item,
              quantity: newQty,
              subtotal: calculateLineSubtotal(item.price, newQty),
              availableStock: product.stock,
            }
          : item,
      );
    } else {
      nextItems = [...items, buildCartItem(product, qty)];
    }

    set({
      items: nextItems,
      totals: recalculateTotals(nextItems, discount),
    });
  },

  removeFromCart: (productId) => {
    const { items, discount } = get();
    const nextItems = items.filter((item) => item.productId !== productId);
    set({
      items: nextItems,
      totals: recalculateTotals(nextItems, discount),
    });
  },

  updateQuantity: (productId, quantity) => {
    const { items, discount } = get();
    const item = items.find((entry) => entry.productId === productId);
    if (!item) {
      return;
    }

    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }

    const newQty = Math.min(quantity, item.availableStock);
    const nextItems = items.map((entry) =>
      entry.productId === productId
        ? {
            ...entry,
            quantity: newQty,
            subtotal: calculateLineSubtotal(entry.price, newQty),
          }
        : entry,
    );

    set({
      items: nextItems,
      totals: recalculateTotals(nextItems, discount),
    });
  },

  setDiscount: (discount) => {
    const { items } = get();
    set({
      discount,
      totals: recalculateTotals(items, discount),
    });
  },

  clearCart: () =>
    set({
      items: [],
      discount: null,
      totals: recalculateTotals([], null),
    }),

  setCheckoutLoading: (checkoutLoading) => set({ checkoutLoading }),
  setLastInvoiceId: (lastInvoiceId) => set({ lastInvoiceId }),
  getItem: (productId) => get().items.find((item) => item.productId === productId),
}));

export const findProductByBarcode = (
  products: Product[],
  barcode: string,
): Product | undefined => {
  const normalized = normalizeBarcode(barcode);
  return products.find(
    (product) =>
      normalizeBarcode(product.barcode) === normalized ||
      product.barcode.toLowerCase() === barcode.trim().toLowerCase(),
  );
};
