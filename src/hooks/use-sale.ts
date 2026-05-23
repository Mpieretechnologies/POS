"use client";

import { useCallback, useEffect, useState } from "react";
import { firebaseDb } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config-status";
import { fetchSaleById } from "@/services/billing/sale-service";
import type { SaleWithItems } from "@/types/sale";
import { formatFirebaseError } from "@/utils/firebase-error";

export const useSale = (saleId: string) => {
  const [data, setData] = useState<SaleWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!saleId) {
      setLoading(false);
      return;
    }

    if (!isFirebaseConfigured()) {
      setError("Firebase is not configured.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchSaleById(firebaseDb(), saleId);
      if (!result) {
        setError("Invoice not found.");
        setData(null);
      } else {
        setData(result);
      }
    } catch (err) {
      setError(formatFirebaseError(err));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [saleId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, reload: load };
};
