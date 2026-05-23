"use client";

import { GST_RATES } from "@/types/billing";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency } from "@/utils/currency";

export const TaxSummary = () => {
  const taxByRate = useCartStore((state) => state.totals.taxByRate);
  const tax = useCartStore((state) => state.totals.tax);

  const hasTax = tax > 0;

  return (
    <div className="space-y-2 text-sm">
      <p className="font-medium text-foreground">GST breakdown</p>
      {hasTax ? (
        <div className="space-y-1 text-muted-foreground">
          {GST_RATES.map((rate) =>
            taxByRate[rate] > 0 ? (
              <div key={rate} className="flex justify-between">
                <span>GST @ {rate}%</span>
                <span className="tabular-nums">{formatCurrency(taxByRate[rate])}</span>
              </div>
            ) : null,
          )}
        </div>
      ) : (
        <p className="text-muted-foreground">No tax applied</p>
      )}
    </div>
  );
};
