"use client";

import { useCartStore } from "@/store/cart-store";
import { formatCurrency } from "@/utils/currency";
import { DiscountInput } from "@/components/billing/discount-input";
import { TaxSummary } from "@/components/billing/tax-summary";
import { cn } from "@/lib/utils";

type BillingSummaryProps = {
  className?: string;
};

export const BillingSummary = ({ className }: BillingSummaryProps) => {
  const totals = useCartStore((state) => state.totals);

  return (
    <div className={cn("space-y-4 rounded-xl border border-border bg-card p-4", className)}>
      <DiscountInput />
      <TaxSummary />
      <div className="space-y-2 border-t border-border pt-3 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatCurrency(totals.subtotal)}</span>
        </div>
        {totals.discountAmount > 0 ? (
          <div className="flex justify-between text-emerald-600">
            <span>Discount</span>
            <span className="tabular-nums">-{formatCurrency(totals.discountAmount)}</span>
          </div>
        ) : null}
        <div className="flex justify-between text-muted-foreground">
          <span>Tax</span>
          <span className="tabular-nums">{formatCurrency(totals.tax)}</span>
        </div>
        <div className="flex justify-between text-base font-semibold text-foreground">
          <span>Grand total</span>
          <span className="tabular-nums">{formatCurrency(totals.finalTotal)}</span>
        </div>
      </div>
    </div>
  );
};
