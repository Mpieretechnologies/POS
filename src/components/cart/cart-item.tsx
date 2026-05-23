"use client";

import { Trash2Icon } from "lucide-react";
import { QuantityController } from "@/components/cart/quantity-controller";
import { Button } from "@/components/ui/button";
import type { CartItem as CartItemType } from "@/types/cart";
import { formatCurrency } from "@/utils/currency";

type CartItemProps = {
  item: CartItemType;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
  disabled?: boolean;
};

export const CartItem = ({
  item,
  onIncrease,
  onDecrease,
  onRemove,
  disabled = false,
}: CartItemProps) => (
  <div className="flex items-start justify-between gap-3 border-b border-border py-3 last:border-0">
    <div className="min-w-0 flex-1">
      <p className="truncate font-medium text-foreground">{item.productName}</p>
      <p className="text-xs text-muted-foreground">
        {formatCurrency(item.price)} · GST {item.taxRate}%
      </p>
      <p className="mt-2 text-sm font-semibold tabular-nums">
        {formatCurrency(item.subtotal)}
      </p>
    </div>
    <div className="flex flex-col items-end gap-2">
      <QuantityController
        quantity={item.quantity}
        max={item.availableStock}
        onIncrease={onIncrease}
        onDecrease={onDecrease}
        disabled={disabled}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={onRemove}
        disabled={disabled}
        aria-label={`Remove ${item.productName}`}
      >
        <Trash2Icon className="text-destructive" />
      </Button>
    </div>
  </div>
);
