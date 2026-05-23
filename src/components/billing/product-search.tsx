
"use client";

import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";

type ProductSearchProps = {
  value: string;
  onChange: (value: string) => void;
  inputClassName?: string;
};

export const ProductSearch = ({ value, onChange, inputClassName }: ProductSearchProps) => (
  <div className="relative w-full">
    <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
    <Input
      type="search"
      placeholder="Search by product name…"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={cn("pl-9", inputClassName)}
      aria-label="Search products"
    />
  </div>
);
