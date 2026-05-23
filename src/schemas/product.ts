import { z } from "zod";
import { PRODUCT_CATEGORIES } from "@/types/product";

export const productFormSchema = z.object({
  productName: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(120, "Product name must be at most 120 characters"),
  barcode: z
    .string()
    .trim()
    .min(4, "Barcode must be at least 4 characters")
    .max(64, "Barcode must be at most 64 characters"),
  category: z.enum(PRODUCT_CATEGORIES, {
    error: "Select a category",
  }),
  price: z
    .number({ error: "Enter a valid price" })
    .min(0, "Price cannot be negative")
    .max(1_000_000, "Price is too large"),
  stock: z
    .number({ error: "Enter a valid stock quantity" })
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .max(1_000_000, "Stock is too large"),
  minimumStock: z
    .number({ error: "Enter a valid minimum stock" })
    .int("Minimum stock must be a whole number")
    .min(0, "Minimum stock cannot be negative")
    .max(1_000_000, "Minimum stock is too large"),
  productImage: z.string(),
  description: z
    .string()
    .trim()
    .max(500, "Description must be at most 500 characters"),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const stockUpdateSchema = z.object({
  stock: z
    .number({ error: "Enter a valid stock quantity" })
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .max(1_000_000, "Stock is too large"),
});

export type StockUpdateFormValues = z.infer<typeof stockUpdateSchema>;
