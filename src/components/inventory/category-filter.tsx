"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInventoryStore } from "@/store/inventory-store";
import { PRODUCT_CATEGORIES, type ProductSortOption } from "@/types/product";

const SORT_OPTIONS: { value: ProductSortOption; label: string }[] = [
  { value: "latest", label: "Latest updated" },
  { value: "name", label: "Name (A–Z)" },
  { value: "stock-asc", label: "Stock (low to high)" },
  { value: "stock-desc", label: "Stock (high to low)" },
];

export const CategoryFilter = () => {
  const { filters, setFilters } = useInventoryStore();

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="grid gap-2">
        <Label htmlFor="category-filter">Category</Label>
        <Select
          value={filters.category ?? "all"}
          onValueChange={(value) =>
            setFilters({ category: value === "all" ? null : value })
          }
        >
          <SelectTrigger id="category-filter" className="w-full">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {PRODUCT_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="sort-filter">Sort by</Label>
        <Select
          value={filters.sortBy}
          onValueChange={(value) => setFilters({ sortBy: value as ProductSortOption })}
        >
          <SelectTrigger id="sort-filter" className="w-full">
            <SelectValue placeholder="Sort products" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="stock-filter">Stock filter</Label>
        <Select
          value={filters.lowStockOnly ? "low" : "all"}
          onValueChange={(value) => setFilters({ lowStockOnly: value === "low" })}
        >
          <SelectTrigger id="stock-filter" className="w-full">
            <SelectValue placeholder="All stock levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stock levels</SelectItem>
            <SelectItem value="low">Low stock only</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
