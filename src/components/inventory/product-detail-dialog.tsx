"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/product";
import { formatCurrency, getStockStatus } from "@/utils/product-stock";

type ProductDetailDialogProps = {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin?: boolean;
};

export const ProductDetailDialog = ({
  product,
  open,
  onOpenChange,
  isAdmin,
}: ProductDetailDialogProps) => {
  if (!product) {
    return null;
  }

  const status = getStockStatus(product.stock, product.minimumStock);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{product.productName}</DialogTitle>
          <DialogDescription>Product details and stock information.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {product.productImage ? (
            <div className="relative mx-auto aspect-square w-full max-w-[220px] overflow-hidden rounded-lg bg-muted">
              <Image
                src={product.productImage}
                alt={product.productName}
                fill
                className="object-cover"
                sizes="220px"
              />
            </div>
          ) : null}

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Barcode</dt>
              <dd className="font-mono font-medium">{product.barcode}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Category</dt>
              <dd className="font-medium">{product.category}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Price</dt>
              <dd className="font-medium">{formatCurrency(product.price)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Stock</dt>
              <dd className="font-medium">{product.stock}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Minimum stock</dt>
              <dd className="font-medium">{product.minimumStock}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <Badge variant={status === "in-stock" ? "outline" : "destructive"}>
                  {status === "in-stock"
                    ? "In stock"
                    : status === "low-stock"
                      ? "Low stock"
                      : "Out of stock"}
                </Badge>
              </dd>
            </div>
          </dl>

          {product.description ? (
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="mt-1 text-sm">{product.description}</p>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {isAdmin ? (
            <Button
              nativeButton={false}
              render={<Link href={`/dashboard/inventory/edit/${product.id}`} />}
            >
              Edit product
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
