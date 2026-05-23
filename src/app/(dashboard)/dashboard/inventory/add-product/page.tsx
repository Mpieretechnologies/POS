"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { RoleGate } from "@/components/auth/role-gate";
import { ProductForm } from "@/components/inventory/product-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftIcon } from "lucide-react";

export default function AddProductPage() {
  const router = useRouter();

  return (
    <RoleGate allow={["ADMIN"]}>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6 md:p-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            nativeButton={false}
            render={<Link href="/dashboard/inventory" />}
            aria-label="Back to inventory"
          >
            <ArrowLeftIcon />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Add product</h1>
            <p className="text-sm text-muted-foreground">
              Create a new product in your inventory catalog.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product details</CardTitle>
            <CardDescription>
              Barcodes can be generated automatically or scanned in a future release.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductForm
              mode="create"
              onSuccess={() => router.push("/dashboard/inventory")}
            />
          </CardContent>
        </Card>
      </div>
    </RoleGate>
  );
}
