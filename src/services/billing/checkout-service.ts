import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
  type Firestore,
} from "firebase/firestore";
import type { PaymentMethod } from "@/types/billing";
import type { CartDiscount, CartItem } from "@/types/cart";
import type { CheckoutInput } from "@/types/sale";
import { calculateBillingTotals } from "@/utils/billing-calculations";
import { generateInvoiceNumber } from "@/utils/invoice-number";

const SALES = "sales";
const SALE_ITEMS = "saleItems";
const PRODUCTS = "products";

export class CheckoutError extends Error {
  constructor(
    message: string,
    public readonly code: "EMPTY_CART" | "STOCK_UNAVAILABLE" | "CHECKOUT_FAILED",
  ) {
    super(message);
    this.name = "CheckoutError";
  }
}

export type CheckoutResult = {
  saleId: string;
  invoiceNumber: string;
};

export const processCheckout = async (
  db: Firestore,
  items: CartItem[],
  discount: CartDiscount | null,
  paymentMethod: PaymentMethod,
  input: CheckoutInput,
): Promise<CheckoutResult> => {
  if (items.length === 0) {
    throw new CheckoutError("Cart is empty.", "EMPTY_CART");
  }

  const totals = calculateBillingTotals(items, discount);
  const invoiceNumber = generateInvoiceNumber();

  try {
    const saleId = await runTransaction(db, async (transaction) => {
      const productRefs = items.map((item) => doc(db, PRODUCTS, item.productId));
      const productSnaps = await Promise.all(
        productRefs.map((ref) => transaction.get(ref)),
      );

      for (let index = 0; index < items.length; index++) {
        const item = items[index];
        const snap = productSnaps[index];

        if (!snap.exists()) {
          throw new CheckoutError(
            `${item.productName} is no longer available.`,
            "STOCK_UNAVAILABLE",
          );
        }

        const stock = snap.data().stock;
        if (typeof stock !== "number" || stock < item.quantity) {
          throw new CheckoutError(
            `Insufficient stock for ${item.productName}. Available: ${typeof stock === "number" ? stock : 0}.`,
            "STOCK_UNAVAILABLE",
          );
        }
      }

      const saleRef = doc(collection(db, SALES));
      transaction.set(saleRef, {
        employeeId: input.employeeId,
        cashierName: input.cashierName,
        invoiceNumber,
        subtotal: totals.subtotal,
        discount: totals.discountAmount,
        discountType: discount?.type ?? "flat",
        discountValue: discount?.value ?? 0,
        tax: totals.tax,
        finalTotal: totals.finalTotal,
        paymentMethod,
        createdAt: serverTimestamp(),
      });

      for (let index = 0; index < items.length; index++) {
        const item = items[index]!;
        const snap = productSnaps[index]!;
        const productData = snap.data()!;
        const currentStock = productData.stock as number;
        const newStock = currentStock - item.quantity;
        const productName =
          typeof productData.productName === "string"
            ? productData.productName
            : item.productName;

        const saleItemRef = doc(collection(db, SALE_ITEMS));
        transaction.set(saleItemRef, {
          saleId: saleRef.id,
          productId: item.productId,
          productName: item.productName,
          barcode: item.barcode,
          quantity: item.quantity,
          price: item.price,
          taxRate: item.taxRate,
          total: item.subtotal,
        });

        transaction.update(productRefs[index], {
          stock: newStock,
          updatedAt: serverTimestamp(),
        });

        const logRef = doc(collection(db, "inventoryLogs"));
        transaction.set(logRef, {
          productId: item.productId,
          productName,
          previousStock: currentStock,
          newStock,
          changeType: "sale",
          changedBy: input.employeeId,
          createdAt: serverTimestamp(),
        });
      }

      return saleRef.id;
    });

    return { saleId, invoiceNumber };
  } catch (error) {
    if (error instanceof CheckoutError) {
      throw error;
    }
    throw new CheckoutError(
      error instanceof Error ? error.message : "Checkout failed.",
      "CHECKOUT_FAILED",
    );
  }
};
