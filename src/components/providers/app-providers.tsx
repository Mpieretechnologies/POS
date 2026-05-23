"use client";

import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { initFirebaseAnalytics } from "@/lib/firebase/analytics";
import { AuthProvider } from "@/store/auth-provider";

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    void initFirebaseAnalytics();
  }, []);

  return (
    <AuthProvider>
      {children}
      <Toaster richColors closeButton position="top-right" />
    </AuthProvider>
  );
};
