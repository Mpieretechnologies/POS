"use client";

import { useCallback, useEffect, useState } from "react";
import { firebaseDb } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config-status";
import { fetchFilteredProducts } from "@/services/products/product-service";
import type { Product, ProductFilters } from "@/types/product";
import { formatFirebaseError } from "@/utils/firebase-error";

const billingFilters = (search: string): ProductFilters => ({
  search,
  category: null,
  lowStockOnly: false,
  sortBy: "name",
});

export const useBillingProducts = (search: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isFirebaseConfigured()) {
      setError("Firebase is not configured.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFilteredProducts(
        firebaseDb(),
        billingFilters(search),
      );
      setProducts(result.filter((product) => product.stock > 0 || search.trim()));
    } catch (err) {
      setError(formatFirebaseError(err));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void load();
  }, [load]);

  return { products, loading, error, reload: load };
};
