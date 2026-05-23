export const GST_RATES = [5, 12, 18, 28] as const;

export type GstRate = (typeof GST_RATES)[number];

export const PAYMENT_METHODS = ["cash", "card", "upi", "other"] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export type BillingTotals = {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  tax: number;
  taxByRate: Record<GstRate, number>;
  finalTotal: number;
};
