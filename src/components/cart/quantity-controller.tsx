"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type QuantityControllerProps = {
  quantity: number;
  max?: number;
  onIncrease: () => void;
  onDecrease: () => void;
  disabled?: boolean;
};

export const QuantityController = ({
  quantity,
  max,
  onIncrease,
  onDecrease,
  disabled = false,
}: QuantityControllerProps) => {
  const atMax = max !== undefined && quantity >= max;

  return (
    <div className="inline-flex items-center gap-1" role="group" aria-label="Quantity">
      <Button
        type="button"
        variant="outline"
        size="icon-xs"
        onClick={onDecrease}
        disabled={disabled || quantity <= 1}
        aria-label="Decrease quantity"
      >
        <MinusIcon />
      </Button>
      <span className="min-w-8 text-center text-sm font-medium tabular-nums">
        {quantity}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon-xs"
        onClick={onIncrease}
        disabled={disabled || atMax}
        aria-label="Increase quantity"
      >
        <PlusIcon />
      </Button>
    </div>
  );
};
