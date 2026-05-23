"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { EmployeeSalesRow } from "@/types/reports";
import { formatCurrency } from "@/utils/currency";

type EmployeeSalesTableProps = {
  rows: EmployeeSalesRow[];
};

export const EmployeeSalesTable = ({ rows }: EmployeeSalesTableProps) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Rank</TableHead>
        <TableHead>Employee</TableHead>
        <TableHead className="text-right">Invoices</TableHead>
        <TableHead className="text-right">Revenue</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {rows.map((row) => (
        <TableRow key={row.employeeId}>
          <TableCell>{row.rank}</TableCell>
          <TableCell className="font-medium">{row.employeeName}</TableCell>
          <TableCell className="text-right">{row.invoiceCount}</TableCell>
          <TableCell className="text-right">{formatCurrency(row.revenue)}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);
