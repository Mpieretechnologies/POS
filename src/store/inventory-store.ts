import { create } from "zustand";
import type { ProductFilters } from "@/types/product";

const defaultFilters: ProductFilters = {
  search: "",
  category: null,
  lowStockOnly: false,
  sortBy: "latest",
};

type InventoryStore = {
  refreshToken: number;
  filters: ProductFilters;
  triggerRefresh: () => void;
  setFilters: (filters: Partial<ProductFilters>) => void;
  resetFilters: () => void;
};

export const useInventoryStore = create<InventoryStore>((set) => ({
  refreshToken: 0,
  filters: defaultFilters,
  triggerRefresh: () => set((state) => ({ refreshToken: state.refreshToken + 1 })),
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
