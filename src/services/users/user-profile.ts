import type { FirestoreUser, UserRole } from "@/types/user";

export const mapRole = (value: unknown): UserRole | null => {
  if (value === "ADMIN" || value === "CASHIER") {
    return value;
  }
  return null;
};

export const parseUserProfile = (
  uid: string,
  data: Partial<FirestoreUser>,
): (FirestoreUser & { uid: string }) | null => {
  const role = mapRole(data.role);
  if (!data.email || !role) {
    return null;
  }
  return { uid, email: data.email, role, displayName: data.displayName };
};

export type UserProfile = FirestoreUser & { uid: string };
