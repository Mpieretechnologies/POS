"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PlusIcon, RefreshCwIcon } from "lucide-react";
import { RoleGate } from "@/components/auth/role-gate";
import { DeleteProductDialog } from "@/components/inventory/delete-product-dialog";
import { CategoryFilter } from "@/components/inventory/category-filter";
import { InventoryStats } from "@/components/inventory/inventory-stats";
import { ProductDetailDialog } from "@/components/inventory/product-detail-dialog";
import { RecentStockUpdates } from "@/components/inventory/recent-stock-updates";
import { SearchBar } from "@/components/inventory/search-bar";
import { StockAlertCard } from "@/components/inventory/stock-alert-card";
import { ProductTable } from "@/components/tables/product-table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useInventoryStats } from "@/hooks/use-inventory-stats";
import { useProducts } from "@/hooks/use-products";
import { useInventoryStore } from "@/store/inventory-store";
import type { Product } from "@/types/product";

export const InventoryDashboard = () => {
  const searchParams = useSearchParams();
  const { appUser } = useAuth();
  const { setFilters } = useInventoryStore();
  const { products, loading, error, hasMore, loadingMore, reload, loadMore } = useProducts();
  const { stats, recentLogs, loading: statsLoading, error: statsError, reload: reloadStats } =
    useInventoryStats();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isAdmin = appUser?.role === "ADMIN";

  useEffect(() => {
    if (searchParams.get("filter") === "low") {
      setFilters({ lowStockOnly: true });
    }
  }, [searchParams, setFilters]);

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setDetailOpen(true);
  };

  const handleDelete = (product: Product) => {
    setDeleteTarget(product);
    setDeleteOpen(true);
  };

  const handleRetry = () => {
    void reload();
    void reloadStats();
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6 md:p-10">
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Phase 2</p>
          <h1 className="text-2xl font-semibold tracking-tight">Inventory Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track products, stock levels, and alerts across your store.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleRetry}>
            <RefreshCwIcon data-icon="inline-start" />
            Refresh
          </Button>
          <RoleGate allow={["ADMIN"]} fallback={null}>
            <Button nativeButton={false} render={<Link href="/dashboard/inventory/add-product" />}>
              <PlusIcon data-icon="inline-start" />
              Add product
            </Button>
          </RoleGate>
        </div>
      </header>

      {error || statsError ? (
        <Alert variant="destructive">
          <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
            <span>{error ?? statsError}</span>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <InventoryStats stats={stats} loading={statsLoading} />

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <StockAlertCard stats={stats} loading={statsLoading} />
        <RecentStockUpdates logs={recentLogs} loading={statsLoading} />
      </div>

      <Card>
        <CardHeader className="gap-4">
          <CardTitle className="text-base">Products</CardTitle>
          <SearchBar />
          <CategoryFilter />
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <ProductTable
                products={products}
                isAdmin={isAdmin}
                onView={handleView}
                onDelete={handleDelete}
              />
              {hasMore ? (
                <div className="flex justify-center">
                  <Button variant="outline" onClick={() => void loadMore()} disabled={loadingMore}>
                    {loadingMore ? "Loading…" : "Load more products"}
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <ProductDetailDialog
        product={selectedProduct}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        isAdmin={isAdmin}
      />

      <DeleteProductDialog
        product={deleteTarget}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </div>
  );
};
