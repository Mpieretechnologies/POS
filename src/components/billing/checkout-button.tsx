"use client";

import { CreditCardIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

type CheckoutButtonProps = {
  onCheckout: () => void;
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg";
  className?: string;
};

export const CheckoutButton = ({ onCheckout, size = "lg", className }: CheckoutButtonProps) => {
  const items = useCartStore((state) => state.items);
  const totals = useCartStore((state) => state.totals);
  const checkoutLoading = useCartStore((state) => state.checkoutLoading);

  return (
    <Button
      type="button"
      size={size}
      className={cn("w-full", className)}
      disabled={items.length === 0 || checkoutLoading}
      onClick={onCheckout}
    >
      <CreditCardIcon />
      {checkoutLoading ? "Processing…" : `Checkout · ${totals.finalTotal.toFixed(2)}`}
    </Button>
  );
};
