"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { firebaseDb } from "@/lib/firebase/client";
import { deleteProduct } from "@/services/products/product-service";
import { useInventoryStore } from "@/store/inventory-store";
import type { Product } from "@/types/product";
import { formatFirebaseError } from "@/utils/firebase-error";
import { toast } from "sonner";

type DeleteProductDialogProps = {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
};

export const DeleteProductDialog = ({
  product,
  open,
  onOpenChange,
  onDeleted,
}: DeleteProductDialogProps) => {
  const [deleting, setDeleting] = useState(false);
  const triggerRefresh = useInventoryStore((state) => state.triggerRefresh);

  const handleDelete = async () => {
    if (!product) {
      return;
    }

    setDeleting(true);
    try {
      await deleteProduct(firebaseDb(), product.id);
      triggerRefresh();
      toast.success("Product deleted successfully.");
      onOpenChange(false);
      onDeleted?.();
    } catch (error) {
      toast.error(formatFirebaseError(error));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete product</DialogTitle>
          <DialogDescription>
            This will permanently remove{" "}
            <span className="font-medium text-foreground">{product?.productName}</span> from
            inventory. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => void handleDelete()} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
