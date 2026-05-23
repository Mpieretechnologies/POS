import type { Timestamp } from "firebase/firestore";
import type { DateRange, DateRangePreset } from "@/types/reports";

export const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const endOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

export const startOfMonth = (date: Date): Date =>
  startOfDay(new Date(date.getFullYear(), date.getMonth(), 1));

export const endOfMonth = (date: Date): Date =>
  endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const toFirestoreDate = (value: Timestamp | undefined | null): Date | null => {
  if (!value || typeof value.toDate !== "function") {
    return null;
  }
  return value.toDate();
};

export const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatMonthKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export const formatChartDayLabel = (dateKey: string): string => {
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) {
    return dateKey;
  }
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

export const formatChartMonthLabel = (monthKey: string): string => {
  const [year, month] = monthKey.split("-").map(Number);
  if (!year || !month) {
    return monthKey;
  }
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: "short",
    year: "2-digit",
  });
};

export const resolveDateRange = (
  preset: DateRangePreset,
  customStart?: Date,
  customEnd?: Date,
  referenceDate = new Date(),
): DateRange => {
  const today = startOfDay(referenceDate);

  switch (preset) {
    case "today":
      return { preset, start: today, end: endOfDay(today) };
    case "yesterday": {
      const day = addDays(today, -1);
      return { preset, start: day, end: endOfDay(day) };
    }
    case "last7days":
      return { preset, start: startOfDay(addDays(today, -6)), end: endOfDay(today) };
    case "last30days":
      return { preset, start: startOfDay(addDays(today, -29)), end: endOfDay(today) };
    case "thisMonth":
      return { preset, start: startOfMonth(today), end: endOfDay(today) };
    case "custom": {
      const start = startOfDay(customStart ?? today);
      const end = endOfDay(customEnd ?? today);
      return { preset, start, end };
    }
    default:
      return { preset: "last7days", start: startOfDay(addDays(today, -6)), end: endOfDay(today) };
  }
};

export const eachDayInRange = (range: DateRange): string[] => {
  const days: string[] = [];
  let cursor = startOfDay(range.start);
  const end = startOfDay(range.end);

  while (cursor <= end) {
    days.push(formatDateKey(cursor));
    cursor = addDays(cursor, 1);
  }

  return days;
};

export const getPreviousPeriodRange = (range: DateRange): DateRange => {
  const durationMs = range.end.getTime() - range.start.getTime();
  const previousEnd = new Date(range.start.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - durationMs);

  return {
    preset: range.preset,
    start: startOfDay(previousStart),
    end: endOfDay(previousEnd),
  };
};

export const getPresetLabel = (preset: DateRangePreset): string => {
  switch (preset) {
    case "today":
      return "Today";
    case "yesterday":
      return "Yesterday";
    case "last7days":
      return "Last 7 Days";
    case "last30days":
      return "Last 30 Days";
    case "thisMonth":
      return "This Month";
    case "custom":
      return "Custom Range";
    default:
      return preset;
  }
};
