"use client";

import { ShoppingCartIcon } from "lucide-react";
import { CartItem } from "@/components/cart/cart-item";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";

export const CartTable = () => {
  const items = useCartStore((state) => state.items);
  const checkoutLoading = useCartStore((state) => state.checkoutLoading);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <ShoppingCartIcon className="size-10 text-muted-foreground/60" />
        <div>
          <p className="font-medium text-foreground">Cart is empty</p>
          <p className="text-sm text-muted-foreground">
            Search products or scan a barcode to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          {items.length} item{items.length === 1 ? "" : "s"}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearCart}
          disabled={checkoutLoading}
        >
          Clear cart
        </Button>
      </div>
      <div className="max-h-[min(50vh,420px)] overflow-y-auto pr-1">
        {items.map((item) => (
          <CartItem
            key={item.productId}
            item={item}
            disabled={checkoutLoading}
            onIncrease={() => updateQuantity(item.productId, item.quantity + 1)}
            onDecrease={() => updateQuantity(item.productId, item.quantity - 1)}
            onRemove={() => removeFromCart(item.productId)}
          />
        ))}
      </div>
    </div>
  );
};
