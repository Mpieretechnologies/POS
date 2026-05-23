"use client";

import Image from "next/image";
import Link from "next/link";
import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Product } from "@/types/product";
import { formatCurrency, getStockStatus } from "@/utils/product-stock";

type ProductTableProps = {
  products: Product[];
  isAdmin: boolean;
  onView: (product: Product) => void;
  onDelete: (product: Product) => void;
};

const stockBadgeVariant = (status: ReturnType<typeof getStockStatus>) => {
  switch (status) {
    case "out-of-stock":
      return "destructive" as const;
    case "low-stock":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
};

const stockBadgeLabel = (status: ReturnType<typeof getStockStatus>) => {
  switch (status) {
    case "out-of-stock":
      return "Out of stock";
    case "low-stock":
      return "Low stock";
    default:
      return "In stock";
  }
};

export const ProductTable = ({
  products,
  isAdmin,
  onView,
  onDelete,
}: ProductTableProps) => {
  if (products.length === 0) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
        <p className="font-medium">No products found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your search or filters, or add a new product.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Barcode</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[60px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const status = getStockStatus(product.stock, product.minimumStock);
            const isAlertRow = status !== "in-stock";

            return (
              <TableRow
                key={product.id}
                className={isAlertRow ? "bg-amber-500/5 hover:bg-amber-500/10" : undefined}
              >
                <TableCell>
                  <button
                    type="button"
                    onClick={() => onView(product)}
                    className="flex items-center gap-3 text-left"
                  >
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
                      {product.productImage ? (
                        <Image
                          src={product.productImage}
                          alt={product.productName}
                          fill
                          className="object-cover"
                          sizes="40px"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                          N/A
                        </div>
                      )}
                    </div>
                    <span className="font-medium hover:underline">{product.productName}</span>
                  </button>
                </TableCell>
                <TableCell className="font-mono text-xs">{product.barcode}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                <TableCell className="text-right">{product.stock}</TableCell>
                <TableCell>
                  <Badge variant={stockBadgeVariant(status)}>{stockBadgeLabel(status)}</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon-sm" aria-label="Product actions" />
                      }
                    >
                      <MoreHorizontalIcon />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(product)}>
                        View details
                      </DropdownMenuItem>
                      {isAdmin ? (
                        <>
                          <DropdownMenuItem
                            render={
                              <Link href={`/dashboard/inventory/edit/${product.id}`} />
                            }
                          >
                            <PencilIcon />
                            Edit product
                          </DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onClick={() => onDelete(product)}>
                            <Trash2Icon />
                            Delete product
                          </DropdownMenuItem>
                        </>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
