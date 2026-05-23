import type { BillingTotals, GstRate } from "@/types/billing";
import type { CartDiscount, CartItem } from "@/types/cart";
import { GST_RATES } from "@/types/billing";
import { roundMoney } from "@/utils/currency";

const emptyTaxByRate = (): Record<GstRate, number> =>
  GST_RATES.reduce(
    (acc, rate) => {
      acc[rate] = 0;
      return acc;
    },
    {} as Record<GstRate, number>,
  );

export const calculateLineSubtotal = (price: number, quantity: number): number =>
  roundMoney(price * quantity);

export const calculateDiscountAmount = (
  subtotal: number,
  discount: CartDiscount | null,
): number => {
  if (!discount || discount.value <= 0 || subtotal <= 0) {
    return 0;
  }

  if (discount.type === "flat") {
    return roundMoney(Math.min(discount.value, subtotal));
  }

  const percentage = Math.min(Math.max(discount.value, 0), 100);
  return roundMoney((subtotal * percentage) / 100);
};

export const calculateBillingTotals = (
  items: CartItem[],
  discount: CartDiscount | null,
): BillingTotals => {
  const subtotal = roundMoney(
    items.reduce((sum, item) => sum + item.subtotal, 0),
  );

  const discountAmount = calculateDiscountAmount(subtotal, discount);
  const taxableAmount = roundMoney(Math.max(subtotal - discountAmount, 0));

  const taxByRate = emptyTaxByRate();
  let tax = 0;

  if (subtotal > 0 && taxableAmount > 0) {
    for (const item of items) {
      const itemShare = item.subtotal / subtotal;
      const itemTaxable = roundMoney(taxableAmount * itemShare);
      const itemTax = roundMoney((itemTaxable * item.taxRate) / 100);
      taxByRate[item.taxRate] = roundMoney(taxByRate[item.taxRate] + itemTax);
      tax = roundMoney(tax + itemTax);
    }
  }

  const finalTotal = roundMoney(Math.max(taxableAmount + tax, 0));

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    tax,
    taxByRate,
    finalTotal,
  };
};

export const isValidGstRate = (value: number): value is GstRate =>
  GST_RATES.includes(value as GstRate);

export const normalizeGstRate = (value: unknown): GstRate => {
  if (typeof value === "number" && isValidGstRate(value)) {
    return value;
  }
  return 18;
};
