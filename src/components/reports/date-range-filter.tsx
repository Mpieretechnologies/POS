"use client";

import { useMemo, useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs } from "@/components/ui/tabs";
import { customDateRangeSchema } from "@/schemas/reports";
import { useReportsStore } from "@/store/reports-store";
import { DATE_RANGE_PRESETS, type DateRangePreset } from "@/types/reports";
import { getPresetLabel } from "@/utils/date-range";

const presetItems = DATE_RANGE_PRESETS.filter((preset) => preset !== "custom").map(
  (preset) => ({
    value: preset,
    label: getPresetLabel(preset),
  }),
);

export const DateRangeFilter = () => {
  const { preset, setPreset, setCustomRange } = useReportsStore();
  const [customStart, setCustomStartValue] = useState("");
  const [customEnd, setCustomEndValue] = useState("");
  const [customError, setCustomError] = useState<string | null>(null);

  const activePreset = useMemo(
    () => (preset === "custom" ? "custom" : preset),
    [preset],
  );

  const handlePresetChange = (value: string) => {
    setCustomError(null);
    setPreset(value as DateRangePreset);
  };

  const applyCustomRange = () => {
    const parsed = customDateRangeSchema.safeParse({
      start: customStart,
      end: customEnd,
    });

    if (!parsed.success) {
      setCustomError(parsed.error.issues[0]?.message ?? "Invalid date range.");
      return;
    }

    setCustomError(null);
    setCustomRange(parsed.data.start, parsed.data.end);
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <CalendarIcon className="size-4 text-muted-foreground" />
        Date range
      </div>

      <Tabs value={activePreset} onValueChange={handlePresetChange} items={presetItems} />

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="custom-start">Start date</Label>
          <Input
            id="custom-start"
            type="date"
            value={customStart}
            onChange={(event) => setCustomStartValue(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="custom-end">End date</Label>
          <Input
            id="custom-end"
            type="date"
            value={customEnd}
            onChange={(event) => setCustomEndValue(event.target.value)}
          />
        </div>
        <Button type="button" variant="secondary" onClick={applyCustomRange}>
          Apply custom
        </Button>
      </div>

      {customError ? <p className="text-sm text-destructive">{customError}</p> : null}
    </div>
  );
};
