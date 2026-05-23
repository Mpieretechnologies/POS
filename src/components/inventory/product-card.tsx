"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Product } from "@/types/product";
import { formatCurrency, getStockStatus } from "@/utils/product-stock";

type ProductCardProps = {
  product: Product;
  isAdmin?: boolean;
  onView?: (product: Product) => void;
};

export const ProductCard = ({ product, isAdmin, onView }: ProductCardProps) => {
  const status = getStockStatus(product.stock, product.minimumStock);

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[4/3] w-full bg-muted">
        {product.productImage ? (
          <Image
            src={product.productImage}
            alt={product.productName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-base">{product.productName}</CardTitle>
          <Badge variant={status === "in-stock" ? "outline" : "destructive"}>
            {status === "in-stock" ? "In stock" : status === "low-stock" ? "Low" : "Out"}
          </Badge>
        </div>
        <p className="font-mono text-xs text-muted-foreground">{product.barcode}</p>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <p className="text-muted-foreground">{product.category}</p>
        <p className="font-medium">{formatCurrency(product.price)}</p>
        <p>
          Stock: <span className="font-medium">{product.stock}</span>
        </p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => onView?.(product)}>
          View
        </Button>
        {isAdmin ? (
          <Button
            size="sm"
            className="flex-1"
            nativeButton={false}
            render={<Link href={`/dashboard/inventory/edit/${product.id}`} />}
          >
            Edit
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
};
