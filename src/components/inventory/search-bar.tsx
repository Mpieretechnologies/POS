"use client";

import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useInventoryStore } from "@/store/inventory-store";

export const SearchBar = () => {
  const { filters, setFilters } = useInventoryStore();

  return (
    <div className="relative w-full">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search by product name or barcode…"
        value={filters.search}
        onChange={(event) => setFilters({ search: event.target.value })}
        className="pl-9"
        aria-label="Search products"
      />
    </div>
  );
};
