"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProductSalesRow } from "@/types/reports";
import { formatCurrency } from "@/utils/currency";

type ProductSalesTableProps = {
  rows: ProductSalesRow[];
};

export const ProductSalesTable = ({ rows }: ProductSalesTableProps) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Rank</TableHead>
        <TableHead>Product</TableHead>
        <TableHead className="text-right">Qty sold</TableHead>
        <TableHead className="text-right">Revenue</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {rows.map((row) => (
        <TableRow key={row.productId}>
          <TableCell>{row.rank}</TableCell>
          <TableCell className="font-medium">{row.productName}</TableCell>
          <TableCell className="text-right">{row.quantitySold}</TableCell>
          <TableCell className="text-right">{formatCurrency(row.revenue)}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);
