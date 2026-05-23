"use client";

import { isFirebaseConfigured } from "@/lib/firebase/config-status";
import { getFirebaseApp } from "@/lib/firebase/client";

export const initFirebaseAnalytics = async (): Promise<void> => {
  if (typeof window === "undefined" || !isFirebaseConfigured()) {
    return;
  }

  try {
    const { getAnalytics, isSupported } = await import("firebase/analytics");
    if (!(await isSupported())) {
      return;
    }
    getAnalytics(getFirebaseApp());
  } catch {
    // Analytics is optional; avoid breaking the app in unsupported environments.
  }
};
