import { create } from "zustand";
import type { DashboardAnalytics } from "@/types/reports";
import type { DateRange, DateRangePreset } from "@/types/reports";
import { resolveDateRange } from "@/utils/date-range";

type ReportsStore = {
  preset: DateRangePreset;
  customStart: Date | null;
  customEnd: Date | null;
  dateRange: DateRange;
  analyticsCache: DashboardAnalytics | null;
  cacheKey: string | null;
  exporting: boolean;
  setPreset: (preset: DateRangePreset) => void;
  setCustomRange: (start: Date, end: Date) => void;
  setAnalyticsCache: (cacheKey: string, analytics: DashboardAnalytics) => void;
  clearAnalyticsCache: () => void;
  setExporting: (exporting: boolean) => void;
};

const buildCacheKey = (range: DateRange, employeeId?: string): string =>
  `${range.preset}:${range.start.toISOString()}:${range.end.toISOString()}:${employeeId ?? "all"}`;

const initialRange = resolveDateRange("last7days");

export const useReportsStore = create<ReportsStore>((set, get) => ({
  preset: "last7days",
  customStart: null,
  customEnd: null,
  dateRange: initialRange,
  analyticsCache: null,
  cacheKey: null,
  exporting: false,
  setPreset: (preset) => {
    const { customStart, customEnd } = get();
    const dateRange = resolveDateRange(
      preset,
      customStart ?? undefined,
      customEnd ?? undefined,
    );
    set({ preset, dateRange, analyticsCache: null, cacheKey: null });
  },
  setCustomRange: (start, end) => {
    const dateRange = resolveDateRange("custom", start, end);
    set({
      preset: "custom",
      customStart: start,
      customEnd: end,
      dateRange,
      analyticsCache: null,
      cacheKey: null,
    });
  },
  setAnalyticsCache: (cacheKey, analytics) => set({ cacheKey, analyticsCache: analytics }),
  clearAnalyticsCache: () => set({ cacheKey: null, analyticsCache: null }),
  setExporting: (exporting) => set({ exporting }),
}));

export { buildCacheKey };
