export const USER_ROLES = ["ADMIN", "CASHIER"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type FirestoreUser = {
  email: string;
  role: UserRole;
  displayName?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type AppUser = {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
};
