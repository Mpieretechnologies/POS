"use client";

import Link from "next/link";
import { RoleGate } from "@/components/auth/role-gate";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6 md:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Restricted to users with the ADMIN role (enforced in the UI; backend must mirror
            this in Cloud Functions and rules).
          </p>
        </div>
        <Button variant="outline" nativeButton={false} render={<Link href="/dashboard" />}>
          Back to dashboard
        </Button>
      </div>

      <RoleGate allow={["ADMIN"]}>
        <section className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-base font-semibold">Admin tools</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Placeholder for user management, store settings, and approvals. Only users with{" "}
            <span className="font-medium text-foreground">ADMIN</span> in Firestore should reach
            this page.
          </p>
        </section>
      </RoleGate>
    </div>
  );
}
