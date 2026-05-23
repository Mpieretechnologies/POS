import { z } from "zod";
import { GST_RATES, PAYMENT_METHODS } from "@/types/billing";

export const discountSchema = z
  .object({
    type: z.enum(["flat", "percentage"]),
    value: z.number().min(0, "Discount cannot be negative"),
  })
  .superRefine((data, ctx) => {
    if (data.type === "percentage" && data.value > 100) {
      ctx.addIssue({
        code: "custom",
        message: "Percentage discount cannot exceed 100%",
        path: ["value"],
      });
    }
  });

export const checkoutSchema = z.object({
  paymentMethod: z.enum(PAYMENT_METHODS, {
    error: "Select a payment method",
  }),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export const cartQuantitySchema = z
  .number()
  .int("Quantity must be a whole number")
  .min(1, "Quantity must be at least 1")
  .max(10_000, "Quantity is too large");

export const gstRateSchema = z
  .number()
  .refine((value) => GST_RATES.includes(value as (typeof GST_RATES)[number]), {
    message: "Invalid GST rate",
  });
