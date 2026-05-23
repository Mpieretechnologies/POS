import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  type Firestore,
} from "firebase/firestore";
import type { InventoryChangeType } from "@/types/inventory-log";
import type { InventoryLog } from "@/types/inventory-log";

const INVENTORY_LOGS = "inventoryLogs";

type CreateInventoryLogInput = {
  productId: string;
  productName: string;
  previousStock: number;
  newStock: number;
  changeType: InventoryChangeType;
  changedBy: string;
};

const parseInventoryLog = (id: string, data: Record<string, unknown>): InventoryLog | null => {
  if (
    typeof data.productId !== "string" ||
    typeof data.productName !== "string" ||
    typeof data.previousStock !== "number" ||
    typeof data.newStock !== "number" ||
    typeof data.changeType !== "string" ||
    typeof data.changedBy !== "string" ||
    !data.createdAt
  ) {
    return null;
  }

  return {
    id,
    productId: data.productId,
    productName: data.productName,
    previousStock: data.previousStock,
    newStock: data.newStock,
    changeType: data.changeType as InventoryChangeType,
    changedBy: data.changedBy,
    createdAt: data.createdAt as InventoryLog["createdAt"],
  };
};

export const createInventoryLog = async (
  db: Firestore,
  input: CreateInventoryLogInput,
): Promise<string> => {
  const ref = await addDoc(collection(db, INVENTORY_LOGS), {
    ...input,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const fetchRecentInventoryLogs = async (
  db: Firestore,
  maxResults = 10,
): Promise<InventoryLog[]> => {
  const snap = await getDocs(
    query(collection(db, INVENTORY_LOGS), orderBy("createdAt", "desc"), limit(maxResults)),
  );

  return snap.docs
    .map((item) => parseInventoryLog(item.id, item.data()))
    .filter((item): item is InventoryLog => item !== null);
};
