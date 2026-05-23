"use client";

import { useCallback, useEffect, useState } from "react";
import { firebaseDb } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config-status";
import { getEmployeeSalesReport } from "@/services/reports/report-service";
import { useReportsStore } from "@/store/reports-store";
import type { EmployeeSalesReport } from "@/types/reports";
import { formatFirebaseError } from "@/utils/firebase-error";

export const useEmployeeSalesReport = () => {
  const { dateRange } = useReportsStore();
  const [report, setReport] = useState<EmployeeSalesReport | null>(null);
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
      const result = await getEmployeeSalesReport(firebaseDb(), dateRange);
      setReport(result);
    } catch (err) {
      setError(formatFirebaseError(err));
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    void load();
  }, [load]);

  return { report, loading, error, reload: load, dateRange };
};
