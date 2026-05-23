"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { ImageUploadField } from "@/components/forms/image-upload-field";
import { SelectFormField } from "@/components/forms/select-form-field";
import { TextFormField } from "@/components/forms/text-form-field";
import { TextareaFormField } from "@/components/forms/textarea-form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { firebaseDb, firebaseStorage } from "@/lib/firebase/client";
import { productFormSchema, type ProductFormValues } from "@/schemas/product";
import {
  createProduct,
  fetchProductByBarcode,
  patchProductFields,
  updateProduct,
} from "@/services/products/product-service";
import { uploadProductImage } from "@/services/storage/product-image-service";
import { useInventoryStore } from "@/store/inventory-store";
import { PRODUCT_CATEGORIES } from "@/types/product";
import type { Product } from "@/types/product";
import { generateBarcode } from "@/utils/barcode";
import { formatFirebaseError } from "@/utils/firebase-error";
import { RefreshCwIcon } from "lucide-react";

type ProductFormProps = {
  mode: "create" | "edit";
  product?: Product;
  onSuccess?: (productId: string) => void;
};

export const ProductForm = ({ mode, product, onSuccess }: ProductFormProps) => {
  const { firebaseUser } = useAuth();
  const triggerRefresh = useInventoryStore((state) => state.triggerRefresh);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [clearRemoteImage, setClearRemoteImage] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      productName: product?.productName ?? "",
      barcode: product?.barcode ?? generateBarcode(),
      category: (product?.category as ProductFormValues["category"]) ?? "Other",
      price: product?.price ?? 0,
      stock: product?.stock ?? 0,
      minimumStock: product?.minimumStock ?? 5,
      productImage: product?.productImage ?? "",
      description: product?.description ?? "",
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        productName: product.productName,
        barcode: product.barcode,
        category: product.category as ProductFormValues["category"],
        price: product.price,
        stock: product.stock,
        minimumStock: product.minimumStock,
        productImage: product.productImage,
        description: product.description,
      });
    }
  }, [form, product]);

  const handleGenerateBarcode = () => {
    form.setValue("barcode", generateBarcode(), { shouldValidate: true });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (!firebaseUser) {
      toast.error("You must be signed in to manage products.");
      return;
    }

    const db = firebaseDb();

    try {
      const existingBarcode = await fetchProductByBarcode(db, values.barcode);
      if (existingBarcode && existingBarcode.id !== product?.id) {
        form.setError("barcode", { message: "This barcode is already in use." });
        return;
      }

      let productId = product?.id;
      let imageUrl = clearRemoteImage ? "" : (values.productImage ?? "");

      if (mode === "create") {
        productId = await createProduct(db, { ...values, productImage: "" }, firebaseUser.uid);
      }

      if (!productId) {
        throw new Error("Unable to resolve product ID.");
      }

      if (imageFile) {
        imageUrl = await uploadProductImage(firebaseStorage(), productId, imageFile);
      }

      if (mode === "create") {
        if (imageUrl) {
          await patchProductFields(db, productId, { productImage: imageUrl });
        }
        triggerRefresh();
        toast.success("Product created successfully.");
        onSuccess?.(productId);
        return;
      }

      await updateProduct(
        db,
        productId,
        {
          ...values,
          productImage: imageUrl,
        },
        firebaseUser.uid,
        product,
      );

      triggerRefresh();
      toast.success("Product updated successfully.");
      onSuccess?.(productId);
    } catch (error) {
      toast.error(formatFirebaseError(error));
    }
  });

  const isSubmitting = form.formState.isSubmitting;

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <TextFormField
          id="productName"
          label="Product name"
          disabled={isSubmitting}
          errorMessage={form.formState.errors.productName?.message}
          registration={form.register("productName")}
        />

        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="barcode">Barcode</Label>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={handleGenerateBarcode}
              disabled={isSubmitting}
            >
              <RefreshCwIcon data-icon="inline-start" />
              Generate
            </Button>
          </div>
          <Input
            id="barcode"
            disabled={isSubmitting}
            aria-invalid={Boolean(form.formState.errors.barcode)}
            {...form.register("barcode")}
          />
          {form.formState.errors.barcode?.message ? (
            <p className="text-sm text-destructive" role="alert">
              {form.formState.errors.barcode.message}
            </p>
          ) : null}
        </div>

        <Controller
          control={form.control}
          name="category"
          render={({ field, fieldState }) => (
            <SelectFormField
              id="category"
              label="Category"
              value={field.value}
              onChange={field.onChange}
              options={PRODUCT_CATEGORIES}
              disabled={isSubmitting}
              errorMessage={fieldState.error?.message}
            />
          )}
        />

        <TextFormField
          id="price"
          label="Price"
          type="number"
          disabled={isSubmitting}
          errorMessage={form.formState.errors.price?.message}
          registration={form.register("price", { valueAsNumber: true })}
        />

        <TextFormField
          id="stock"
          label="Stock quantity"
          type="number"
          disabled={isSubmitting}
          errorMessage={form.formState.errors.stock?.message}
          registration={form.register("stock", { valueAsNumber: true })}
        />

        <TextFormField
          id="minimumStock"
          label="Minimum stock"
          type="number"
          disabled={isSubmitting}
          errorMessage={form.formState.errors.minimumStock?.message}
          registration={form.register("minimumStock", { valueAsNumber: true })}
        />
      </div>

      <TextareaFormField
        id="description"
        label="Description"
        disabled={isSubmitting}
        errorMessage={form.formState.errors.description?.message}
        registration={form.register("description")}
      />

      <ImageUploadField
        id="productImage"
        label="Product image"
        value={clearRemoteImage ? undefined : form.watch("productImage")}
        onChange={setImageFile}
        onClearRemote={() => {
          setClearRemoteImage(true);
          form.setValue("productImage", "");
        }}
        disabled={isSubmitting}
      />

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? mode === "create"
              ? "Creating…"
              : "Saving…"
            : mode === "create"
              ? "Create product"
              : "Save changes"}
        </Button>
      </div>
    </form>
  );
};
