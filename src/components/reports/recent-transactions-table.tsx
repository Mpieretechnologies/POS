"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TransactionRow } from "@/types/reports";
import { formatCurrency } from "@/utils/currency";
import { formatDateTime } from "@/utils/date";

type RecentTransactionsTableProps = {
  transactions: TransactionRow[];
};

export const RecentTransactionsTable = ({ transactions }: RecentTransactionsTableProps) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Invoice</TableHead>
        <TableHead>Cashier</TableHead>
        <TableHead>Payment</TableHead>
        <TableHead className="text-right">Total</TableHead>
        <TableHead className="text-right">Date</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {transactions.map((transaction) => (
        <TableRow key={transaction.id}>
          <TableCell>
            <Link
              href={`/dashboard/invoices/${transaction.id}`}
              className="font-medium text-primary hover:underline"
            >
              {transaction.invoiceNumber}
            </Link>
          </TableCell>
          <TableCell>{transaction.cashierName}</TableCell>
          <TableCell className="capitalize">{transaction.paymentMethod}</TableCell>
          <TableCell className="text-right">{formatCurrency(transaction.finalTotal)}</TableCell>
          <TableCell className="text-right text-muted-foreground">
            {formatDateTime(transaction.createdAt)}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);
