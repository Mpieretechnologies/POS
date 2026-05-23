"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { checkoutSchema, type CheckoutFormValues } from "@/schemas/billing";
import { PAYMENT_METHODS } from "@/types/billing";
import { formatCurrency } from "@/utils/currency";
import { useCartStore } from "@/store/cart-store";

type CheckoutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (paymentMethod: CheckoutFormValues["paymentMethod"]) => Promise<void>;
};

const paymentLabels: Record<(typeof PAYMENT_METHODS)[number], string> = {
  cash: "Cash",
  card: "Card",
  upi: "UPI",
  other: "Other",
};

export const CheckoutDialog = ({ open, onOpenChange, onConfirm }: CheckoutDialogProps) => {
  const totals = useCartStore((state) => state.totals);
  const checkoutLoading = useCartStore((state) => state.checkoutLoading);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: "cash" },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onConfirm(values.paymentMethod);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete checkout</DialogTitle>
          <DialogDescription>
            Confirm payment method. Total due: {formatCurrency(totals.finalTotal)}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment method</Label>
            <Select
              value={form.watch("paymentMethod")}
              onValueChange={(value) =>
                form.setValue("paymentMethod", value as CheckoutFormValues["paymentMethod"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="paymentMethod">
                <SelectValue placeholder="Select payment" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {paymentLabels[method]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.paymentMethod ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.paymentMethod.message}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={checkoutLoading}>
              {checkoutLoading ? "Processing…" : "Confirm & pay"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
