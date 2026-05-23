"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCartStore } from "@/store/cart-store";
import type { DiscountType } from "@/types/cart";

export const DiscountInput = () => {
  const discount = useCartStore((state) => state.discount);
  const setDiscount = useCartStore((state) => state.setDiscount);
  const checkoutLoading = useCartStore((state) => state.checkoutLoading);

  const type = discount?.type ?? "percentage";
  const value = discount?.value ?? 0;

  const update = (nextType: DiscountType, nextValue: number) => {
    if (nextValue <= 0) {
      setDiscount(null);
      return;
    }
    setDiscount({ type: nextType, value: nextValue });
  };

  return (
    <div className="space-y-2">
      <Label>Discount</Label>
      <div className="flex gap-2">
        <Select
          value={type}
          onValueChange={(next) => update(next as DiscountType, value)}
          disabled={checkoutLoading}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">%</SelectItem>
            <SelectItem value="flat">Flat (₹)</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="number"
          min={0}
          max={type === "percentage" ? 100 : undefined}
          step={type === "percentage" ? 1 : 0.01}
          value={value || ""}
          onChange={(event) => {
            const parsed = Number(event.target.value);
            update(type, Number.isFinite(parsed) ? parsed : 0);
          }}
          placeholder={type === "percentage" ? "0%" : "0.00"}
          disabled={checkoutLoading}
          className="flex-1"
        />
      </div>
    </div>
  );
};
