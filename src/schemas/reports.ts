import { z } from "zod";
import { DATE_RANGE_PRESETS } from "@/types/reports";

export const dateRangePresetSchema = z.enum(DATE_RANGE_PRESETS);

export const customDateRangeSchema = z
  .object({
    start: z.coerce.date(),
    end: z.coerce.date(),
  })
  .refine((value) => value.start <= value.end, {
    message: "Start date must be before or equal to end date.",
    path: ["end"],
  })
  .refine(
    (value) => {
      const maxSpanMs = 366 * 24 * 60 * 60 * 1000;
      return value.end.getTime() - value.start.getTime() <= maxSpanMs;
    },
    {
      message: "Date range cannot exceed one year.",
      path: ["end"],
    },
  );

export const exportOptionsSchema = z.object({
  reportType: z.enum(["sales", "products", "employees", "daily", "monthly"]),
  format: z.enum(["csv", "pdf"]),
  title: z.string().trim().min(1).max(120),
});

export type ExportOptionsInput = z.infer<typeof exportOptionsSchema>;
