
"use client";

import Image from "next/image";
import { PlusIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import { formatCurrency } from "@/utils/currency";

type ProductListProps = {
  products: Product[];
  loading: boolean;
  onAdd: (product: Product) => void;
  cartProductIds: Set<string>;
  variant?: "default" | "pos";
};

export const ProductList = ({
  products,
  loading,
  onAdd,
  cartProductIds,
  variant = "default",
}: ProductListProps) => {
  const isPos = variant === "pos";
  const gridClass = isPos
    ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    : "grid gap-3 sm:grid-cols-2";

  if (loading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: isPos ? 8 : 6 }).map((_, index) => (
          <Skeleton
            key={index}
            className={cn("w-full rounded-xl", isPos ? "h-36" : "h-24")}
          />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        No products found. Try another search or barcode.
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {products.map((product) => {
        const inCart = cartProductIds.has(product.id);
        const outOfStock = product.stock <= 0;

        return (
          <div
            key={product.id}
            className={cn(
              "relative flex items-center gap-3 rounded-xl border border-border bg-card shadow-sm transition-colors hover:border-primary/30",
              isPos ? "flex-col p-4 text-center" : "p-3",
            )}
          >
            <div
              className={cn(
                "relative shrink-0 overflow-hidden rounded-lg bg-muted",
                isPos ? "size-20 w-full max-w-20" : "size-14",
              )}
            >
              {product.productImage ? (
                <Image
                  src={product.productImage}
                  alt={product.productName}
                  fill
                  className="object-cover"
                  sizes={isPos ? "80px" : "56px"}
                />
              ) : (
                <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                  N/A
                </div>
              )}
            </div>
            <div className={cn("min-w-0 flex-1", isPos && "w-full")}>
              <p className={cn("truncate font-medium", isPos && "text-base")}>
                {product.productName}
              </p>
              <p className="text-xs text-muted-foreground">{product.barcode}</p>
              <div
                className={cn(
                  "mt-1 flex flex-wrap items-center gap-2",
                  isPos && "justify-center",
                )}
              >
                <span className={cn("font-semibold", isPos ? "text-lg" : "text-sm")}>
                  {formatCurrency(product.price)}
                </span>
                <Badge variant="secondary" className="text-[10px]">
                  GST {product.taxRate}%
                </Badge>
                <span className="text-xs text-muted-foreground">Stock: {product.stock}</span>
              </div>
            </div>
            <Button
              type="button"
              size={isPos ? "default" : "icon-sm"}
              onClick={() => onAdd(product)}
              disabled={outOfStock}
              className={cn(isPos && "w-full")}
              aria-label={`Add ${product.productName} to cart`}
            >
              <PlusIcon />
              {isPos ? "Add to cart" : null}
            </Button>
            {inCart ? (
              <Badge className="absolute right-2 top-2 bg-emerald-600 text-white">In cart</Badge>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
