"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { RoleGate } from "@/components/auth/role-gate";
import { ProductForm } from "@/components/inventory/product-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProduct } from "@/hooks/use-product";
import { ArrowLeftIcon } from "lucide-react";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const productId = params.id;
  const { product, loading, error, reload } = useProduct(productId);

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
            <h1 className="text-2xl font-semibold tracking-tight">Edit product</h1>
            <p className="text-sm text-muted-foreground">
              Update product details and stock levels.
            </p>
          </div>
        </div>

        {loading ? (
          <Card>
            <CardContent className="space-y-4 pt-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
        ) : error || !product ? (
          <Alert variant="destructive">
            <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
              <span>{error ?? "Product not found."}</span>
              <Button variant="outline" size="sm" onClick={() => void reload()}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{product.productName}</CardTitle>
              <CardDescription>Barcode: {product.barcode}</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductForm
                mode="edit"
                product={product}
                onSuccess={() => router.push("/dashboard/inventory")}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </RoleGate>
  );
}
