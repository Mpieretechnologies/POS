"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductSalesTable } from "@/components/reports/product-sales-table";
import type { ProductSalesRow } from "@/types/reports";

type BestSellingProductsProps = {
  products: ProductSalesRow[];
  title?: string;
};

export const BestSellingProducts = ({
  products,
  title = "Best-selling products",
}: BestSellingProductsProps) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <ProductSalesTable rows={products} />
    </CardContent>
  </Card>
);
