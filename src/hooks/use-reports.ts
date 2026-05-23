"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { firebaseDb } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config-status";
import {
  buildAnalyticsFromDataset,
  getDashboardAnalytics,
} from "@/services/reports/report-service";
import {
  fetchAllSalesInRange,
  fetchReportDataset,
  fetchSaleItemsBySaleIds,
  subscribeSalesInRange,
} from "@/services/reports/sales-query-service";
import { buildCacheKey, useReportsStore } from "@/store/reports-store";
import type { DashboardAnalytics } from "@/types/reports";
import { getPreviousPeriodRange } from "@/utils/date-range";
import { formatFirebaseError } from "@/utils/firebase-error";

type UseReportsOptions = {
  employeeId?: string;
  enabled?: boolean;
  realtime?: boolean;
};

export const useReports = (options?: UseReportsOptions) => {
  const dateRange = useReportsStore((state) => state.dateRange);
  const setAnalyticsCache = useReportsStore((state) => state.setAnalyticsCache);

  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const employeeId = options?.employeeId;
  const enabled = options?.enabled !== false;
  const realtime = options?.realtime === true;

  const key = useMemo(
    () => buildCacheKey(dateRange, employeeId),
    [dateRange, employeeId],
  );

  const requestIdRef = useRef(0);

  const fetchAnalytics = useCallback(async () => {
    if (!isFirebaseConfigured()) {
      setError("Firebase is not configured.");
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const db = firebaseDb();
      const result = await getDashboardAnalytics(db, dateRange, employeeId);

      if (requestId !== requestIdRef.current) {
        return;
      }

      setAnalytics(result);
      setAnalyticsCache(key, result);
    } catch (err) {
      if (requestId !== requestIdRef.current) {
        return;
      }
      setError(formatFirebaseError(err));
      setAnalytics(null);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [dateRange, employeeId, key, setAnalyticsCache]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (!realtime) {
      void fetchAnalytics();
      return;
    }

    if (!isFirebaseConfigured()) {
      setError("Firebase is not configured.");
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    const db = firebaseDb();
    const previousRange = getPreviousPeriodRange(dateRange);

    const unsubscribe = subscribeSalesInRange(
      db,
      dateRange,
      (sales) => {
        void (async () => {
          try {
            const [items, previousSales] = await Promise.all([
              fetchSaleItemsBySaleIds(
                db,
                sales.map((sale) => sale.id),
              ),
              fetchAllSalesInRange(db, previousRange, employeeId),
            ]);

            if (requestId !== requestIdRef.current) {
              return;
            }

            const result = buildAnalyticsFromDataset(
              sales,
              items,
              dateRange,
              previousSales,
            );
            setAnalytics(result);
            setAnalyticsCache(key, result);
            setError(null);
          } catch (err) {
            if (requestId !== requestIdRef.current) {
              return;
            }
            setError(formatFirebaseError(err));
          } finally {
            if (requestId === requestIdRef.current) {
              setLoading(false);
            }
          }
        })();
      },
      (err) => {
        if (requestId !== requestIdRef.current) {
          return;
        }
        setError(formatFirebaseError(err));
        setLoading(false);
      },
      { employeeId },
    );

    return () => {
      requestIdRef.current += 1;
      unsubscribe();
    };
  }, [dateRange, employeeId, enabled, fetchAnalytics, key, realtime, setAnalyticsCache]);

  return {
    analytics,
    loading: enabled ? loading : true,
    error,
    reload: fetchAnalytics,
    dateRange,
  };
};

export const useReportDataset = (employeeId?: string) => {
  const dateRange = useReportsStore((state) => state.dateRange);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDataset = useCallback(async () => {
    if (!isFirebaseConfigured()) {
      setError("Firebase is not configured.");
      setLoading(false);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const dataset = await fetchReportDataset(firebaseDb(), dateRange, employeeId);
      return dataset;
    } catch (err) {
      setError(formatFirebaseError(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, [dateRange, employeeId]);

  return { loadDataset, loading, error, dateRange };
};
