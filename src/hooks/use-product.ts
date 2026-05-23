"use client";

import { useCallback, useEffect, useState } from "react";
import { firebaseDb } from "@/lib/firebase/client";
import { fetchProductById } from "@/services/products/product-service";
import { useInventoryStore } from "@/store/inventory-store";
import type { Product } from "@/types/product";
import { formatFirebaseError } from "@/utils/firebase-error";

export const useProduct = (productId: string | null) => {
  const { refreshToken } = useInventoryStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(Boolean(productId));
  const [error, setError] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    if (!productId) {
      setProduct(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await fetchProductById(firebaseDb(), productId);
      setProduct(result);
      if (!result) {
        setError("Product not found.");
      }
    } catch (err) {
      setError(formatFirebaseError(err));
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void loadProduct();
  }, [loadProduct, refreshToken]);

  return { product, loading, error, reload: loadProduct };
};
