"use client";

import { cn } from "@/lib/utils";

type TabsProps = {
  value: string;
  onValueChange: (value: string) => void;
  items: { value: string; label: string }[];
  className?: string;
};

export const Tabs = ({ value, onValueChange, items, className }: TabsProps) => (
  <div className={cn("inline-flex flex-wrap gap-1 rounded-lg border bg-muted/40 p-1", className)}>
    {items.map((item) => (
      <button
        key={item.value}
        type="button"
        onClick={() => onValueChange(item.value)}
        className={cn(
          "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          value === item.value
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {item.label}
      </button>
    ))}
  </div>
);
