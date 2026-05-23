"use client";

import { useCallback, useEffect, useState } from "react";
import { firebaseDb } from "@/lib/firebase/client";
import { fetchAllProducts } from "@/services/products/product-service";
import { fetchRecentInventoryLogs } from "@/services/inventory/inventory-log-service";
import { useInventoryStore } from "@/store/inventory-store";
import type { InventoryLog } from "@/types/inventory-log";
import type { InventoryStats } from "@/types/product";
import { computeInventoryStats } from "@/utils/product-stock";
import { formatFirebaseError } from "@/utils/firebase-error";

export const useInventoryStats = () => {
  const { refreshToken } = useInventoryStore();
  const [stats, setStats] = useState<InventoryStats>({
    totalProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalInventoryValue: 0,
  });
  const [recentLogs, setRecentLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const db = firebaseDb();
      const [products, logs] = await Promise.all([
        fetchAllProducts(db),
        fetchRecentInventoryLogs(db, 8),
      ]);
      setStats(computeInventoryStats(products));
      setRecentLogs(logs);
    } catch (err) {
      setError(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats, refreshToken]);

  return { stats, recentLogs, loading, error, reload: loadStats };
};
