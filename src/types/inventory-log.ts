import type { Timestamp } from "firebase/firestore";

export const INVENTORY_CHANGE_TYPES = [
  "initial",
  "manual",
  "restock",
  "sale",
] as const;

export type InventoryChangeType = (typeof INVENTORY_CHANGE_TYPES)[number];

export type FirestoreInventoryLog = {
  productId: string;
  productName: string;
  previousStock: number;
  newStock: number;
  changeType: InventoryChangeType;
  changedBy: string;
  createdAt: Timestamp;
};

export type InventoryLog = FirestoreInventoryLog & {
  id: string;
};
