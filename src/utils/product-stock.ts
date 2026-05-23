import type { Product, InventoryStats } from "@/types/product";

export const isLowStock = (stock: number, minimumStock: number): boolean =>
  stock > 0 && stock <= minimumStock;

export const isOutOfStock = (stock: number): boolean => stock <= 0;

export const getStockStatus = (
  stock: number,
  minimumStock: number,
): "in-stock" | "low-stock" | "out-of-stock" => {
  if (isOutOfStock(stock)) {
    return "out-of-stock";
  }
  if (isLowStock(stock, minimumStock)) {
    return "low-stock";
  }
  return "in-stock";
};

export const computeInventoryStats = (products: Product[]): InventoryStats => {
  let lowStockCount = 0;
  let outOfStockCount = 0;
  let totalInventoryValue = 0;

  for (const product of products) {
    if (isOutOfStock(product.stock)) {
      outOfStockCount += 1;
    } else if (isLowStock(product.stock, product.minimumStock)) {
      lowStockCount += 1;
    }
    totalInventoryValue += product.price * product.stock;
  }

  return {
    totalProducts: products.length,
    lowStockCount,
    outOfStockCount,
    totalInventoryValue,
  };
};

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
