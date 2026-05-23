"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LogOutIcon, MonitorIcon } from "lucide-react";
import { toast } from "sonner";
import { BarcodeScannerInput } from "@/components/billing/barcode-scanner-input";
import { BillingSummary } from "@/components/billing/billing-summary";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { CheckoutDialog } from "@/components/billing/checkout-dialog";
import { ProductList } from "@/components/billing/product-list";
import { ProductSearch } from "@/components/billing/product-search";
import { CartTable } from "@/components/cart/cart-table";
import { ReceiptModal } from "@/components/invoice/receipt-modal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useBillingProducts } from "@/hooks/use-billing-products";
import { useDebounce } from "@/hooks/use-debounce";
import { firebaseDb } from "@/lib/firebase/client";
import { getStoreName } from "@/lib/store-config";
import {
  CheckoutError,
  processCheckout,
} from "@/services/billing/checkout-service";
import { fetchSaleById } from "@/services/billing/sale-service";
import { fetchProductByBarcode } from "@/services/products/product-service";
import { findProductByBarcode, useCartStore } from "@/store/cart-store";
import type { PaymentMethod } from "@/types/billing";
import type { Product } from "@/types/product";
import type { Sale, SaleItem } from "@/types/sale";
import { formatFirebaseError } from "@/utils/firebase-error";

type BillingScreenProps = {
  variant?: "default" | "pos";
};

export const BillingScreen = ({ variant = "default" }: BillingScreenProps) => {
  const isPos = variant === "pos";
  const { appUser } = useAuth();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const { products, loading, error } = useBillingProducts(debouncedSearch);

  const items = useCartStore((state) => state.items);
  const discount = useCartStore((state) => state.discount);
  const addToCart = useCartStore((state) => state.addToCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const setCheckoutLoading = useCartStore((state) => state.setCheckoutLoading);
  const checkoutLoading = useCartStore((state) => state.checkoutLoading);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [completedItems, setCompletedItems] = useState<SaleItem[]>([]);

  const cartProductIds = useMemo(
    () => new Set(items.map((item) => item.productId)),
    [items],
  );

  const handleAddProduct = (product: Product) => {
    if (product.stock <= 0) {
      toast.error("Out of stock", { description: `${product.productName} is unavailable.` });
      return;
    }
    addToCart(product);
    toast.success("Added to cart", { description: product.productName });
  };

  const handleBarcodeScan = async (barcode: string) => {
    const local = findProductByBarcode(products, barcode);
    if (local) {
      handleAddProduct(local);
      return;
    }

    try {
      const product = await fetchProductByBarcode(firebaseDb(), barcode);
      if (!product) {
        toast.error("Product not found", { description: `No product for barcode ${barcode}` });
        return;
      }
      handleAddProduct(product);
    } catch (err) {
      toast.error("Barcode lookup failed", { description: formatFirebaseError(err) });
    }
  };

  const handleCheckout = async (paymentMethod: PaymentMethod) => {
    if (!appUser) {
      toast.error("Not signed in");
      return;
    }

    setCheckoutLoading(true);
    try {
      const result = await processCheckout(
        firebaseDb(),
        items,
        discount,
        paymentMethod,
        {
          employeeId: appUser.uid,
          cashierName: appUser.displayName ?? appUser.email,
        },
      );

      const saleData = await fetchSaleById(firebaseDb(), result.saleId);
      clearCart();
      setCheckoutOpen(false);

      if (saleData) {
        setCompletedSale(saleData.sale);
        setCompletedItems(saleData.items);
        setReceiptOpen(true);
      }

      toast.success("Sale completed", {
        description: `Invoice ${result.invoiceNumber}`,
      });
    } catch (err) {
      if (err instanceof CheckoutError) {
        toast.error(err.message);
      } else {
        toast.error("Checkout failed", { description: formatFirebaseError(err) });
      }
    } finally {
      setCheckoutLoading(false);
    }
  };

  const storeName = getStoreName();
  const cashierName = appUser?.displayName ?? appUser?.email ?? "Cashier";

  const checkoutDialogs = (
    <>
      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        onConfirm={handleCheckout}
      />
      {completedSale ? (
        <ReceiptModal
          open={receiptOpen}
          onOpenChange={setReceiptOpen}
          sale={completedSale}
          items={completedItems}
        />
      ) : null}
    </>
  );

  if (isPos) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-zinc-950 text-zinc-50">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-zinc-800 bg-zinc-900 px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-emerald-50">
              <MonitorIcon className="size-5" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold tracking-tight">{storeName}</h1>
              <p className="truncate text-xs text-zinc-400">POS · {cashierName}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/dashboard" />}
            className="shrink-0 border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 hover:text-white"
          >
            <LogOutIcon className="size-4" />
            Exit POS
          </Button>
        </header>

        {error ? (
          <Alert variant="destructive" className="mx-4 mt-4 shrink-0 md:mx-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <section className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden bg-zinc-100 p-4 text-zinc-950 md:p-5">
            <div className="grid shrink-0 gap-3 md:grid-cols-2">
              <ProductSearch
                value={search}
                onChange={setSearch}
                inputClassName="h-11 text-base"
              />
              <BarcodeScannerInput
                onScan={handleBarcodeScan}
                disabled={checkoutLoading}
                inputClassName="h-11 text-base"
              />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <ProductList
                products={products}
                loading={loading}
                onAdd={handleAddProduct}
                cartProductIds={cartProductIds}
                variant="pos"
              />
            </div>
          </section>

          <aside className="flex w-full shrink-0 flex-col gap-4 border-t border-zinc-800 bg-zinc-900 p-4 lg:w-[min(420px,38vw)] lg:border-l lg:border-t-0">
            <Card className="flex min-h-0 flex-1 flex-col border-zinc-800 bg-zinc-950 text-zinc-50">
              <CardHeader className="shrink-0 pb-2">
                <CardTitle className="text-base">Current order</CardTitle>
              </CardHeader>
              <CardContent className="min-h-0 flex-1 overflow-y-auto">
                <CartTable />
              </CardContent>
            </Card>
            <BillingSummary className="border-zinc-800 bg-zinc-950 text-zinc-50" />
            <CheckoutButton
              onCheckout={() => setCheckoutOpen(true)}
              size="lg"
              className="h-14 text-base font-semibold"
            />
          </aside>
        </div>

        {checkoutDialogs}
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6 md:p-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">POS Checkout</h1>
        <p className="text-sm text-muted-foreground">
          Search products, scan barcodes, and complete sales.
        </p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <ProductSearch value={search} onChange={setSearch} />
            <BarcodeScannerInput onScan={handleBarcodeScan} disabled={checkoutLoading} />
          </div>
          <ProductList
            products={products}
            loading={loading}
            onAdd={handleAddProduct}
            cartProductIds={cartProductIds}
          />
        </div>

        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Cart</CardTitle>
            </CardHeader>
            <CardContent>
              <CartTable />
            </CardContent>
          </Card>
          <BillingSummary />
          <CheckoutButton onCheckout={() => setCheckoutOpen(true)} />
        </div>
      </div>

      {checkoutDialogs}
    </div>
  );
};
