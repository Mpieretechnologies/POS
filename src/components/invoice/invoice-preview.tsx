"use client";

import { formatDateTime } from "@/utils/date";
import { getStoreName } from "@/lib/store-config";
import type { Sale, SaleItem } from "@/types/sale";
import { formatCurrency } from "@/utils/currency";
import { GST_RATES } from "@/types/billing";

type InvoicePreviewProps = {
  sale: Sale;
  items: SaleItem[];
  className?: string;
};

export const InvoicePreview = ({ sale, items, className = "" }: InvoicePreviewProps) => {
  const taxByRate = GST_RATES.reduce(
    (acc, rate) => {
      acc[rate] = items
        .filter((item) => item.taxRate === rate)
        .reduce((sum, item) => sum + (item.total * rate) / (100 + rate), 0);
      return acc;
    },
    {} as Record<number, number>,
  );

  return (
    <div
      id="invoice-print-area"
      className={`mx-auto max-w-md space-y-4 rounded-lg border border-border bg-white p-6 text-black shadow-sm print:border-0 print:shadow-none ${className}`}
    >
      <div className="text-center">
        <h1 className="text-lg font-bold">{getStoreName()}</h1>
        <p className="text-xs text-gray-600">Tax Invoice</p>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-gray-500">Invoice #</p>
          <p className="font-mono font-medium">{sale.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-500">Date</p>
          <p>{formatDateTime(sale.createdAt.toDate())}</p>
        </div>
        <div className="col-span-2">
          <p className="text-gray-500">Cashier</p>
          <p>{sale.cashierName}</p>
        </div>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500">
            <th className="py-2">Item</th>
            <th className="py-2 text-center">Qty</th>
            <th className="py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-gray-100">
              <td className="py-2 pr-2">
                <p className="font-medium">{item.productName}</p>
                <p className="text-gray-500">GST {item.taxRate}%</p>
              </td>
              <td className="py-2 text-center">{item.quantity}</td>
              <td className="py-2 text-right tabular-nums">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(sale.subtotal)}</span>
        </div>
        {sale.discount > 0 ? (
          <div className="flex justify-between text-emerald-700">
            <span>Discount</span>
            <span>-{formatCurrency(sale.discount)}</span>
          </div>
        ) : null}
        <div className="flex justify-between">
          <span>Tax</span>
          <span>{formatCurrency(sale.tax)}</span>
        </div>
        {GST_RATES.map((rate) =>
          taxByRate[rate] > 0.01 ? (
            <div key={rate} className="flex justify-between text-xs text-gray-500">
              <span>GST @ {rate}%</span>
              <span>{formatCurrency(taxByRate[rate])}</span>
            </div>
          ) : null,
        )}
        <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold">
          <span>Total</span>
          <span>{formatCurrency(sale.finalTotal)}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Payment</span>
          <span className="uppercase">{sale.paymentMethod}</span>
        </div>
      </div>
      <p className="text-center text-xs text-gray-500">Thank you for your purchase!</p>
    </div>
  );
};
