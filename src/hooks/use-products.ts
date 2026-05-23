"use client";

import { useCallback, useEffect, useState } from "react";
import { firebaseDb } from "@/lib/firebase/client";
import {
  fetchFilteredProducts,
  fetchProductsPage,
  PRODUCTS_PAGE_SIZE,
} from "@/services/products/product-service";
import { useInventoryStore } from "@/store/inventory-store";
import type { Product } from "@/types/product";
import { formatFirebaseError } from "@/utils/firebase-error";
import type { DocumentSnapshot } from "firebase/firestore";

export const useProducts = () => {
  const { filters, refreshToken } = useInventoryStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const hasActiveFilters =
    Boolean(filters.search.trim()) ||
    Boolean(filters.category) ||
    filters.lowStockOnly ||
    filters.sortBy !== "latest";

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const db = firebaseDb();
      if (hasActiveFilters) {
        const result = await fetchFilteredProducts(db, filters);
        setProducts(result);
        setLastDoc(null);
        setHasMore(false);
      } else {
        const result = await fetchProductsPage(db, { pageSize: PRODUCTS_PAGE_SIZE });
        setProducts(result.products);
        setLastDoc(result.lastDoc);
        setHasMore(result.hasMore);
      }
    } catch (err) {
      setError(formatFirebaseError(err));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters, hasActiveFilters]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || hasActiveFilters || !lastDoc) {
      return;
    }

    setLoadingMore(true);
    setError(null);
    try {
      const db = firebaseDb();
      const result = await fetchProductsPage(db, {
        pageSize: PRODUCTS_PAGE_SIZE,
        lastDoc,
        category: filters.category,
      });
      setProducts((current) => [...current, ...result.products]);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(formatFirebaseError(err));
    } finally {
      setLoadingMore(false);
    }
  }, [filters.category, hasActiveFilters, hasMore, lastDoc, loadingMore]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts, refreshToken]);

  return {
    products,
    loading,
    error,
    hasMore,
    loadingMore,
    reload: loadProducts,
    loadMore,
  };
};
