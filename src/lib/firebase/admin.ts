import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let adminApp: App | undefined;

const readServiceAccountJson = (): string | null => {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (inline) {
    return inline;
  }

  const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim();
  if (!filePath) {
    return null;
  }

  return readFileSync(resolve(process.cwd(), filePath), "utf8");
};

export const isFirebaseAdminConfigured = (): boolean => {
  return Boolean(readServiceAccountJson());
};

export const getAdminApp = (): App => {
  if (adminApp) {
    return adminApp;
  }

  const existing = getApps();
  if (existing.length > 0) {
    adminApp = existing[0];
    return adminApp;
  }

  const raw = readServiceAccountJson();
  if (!raw) {
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON in .env.local.",
    );
  }

  adminApp = initializeApp({
    credential: cert(JSON.parse(raw) as Parameters<typeof cert>[0]),
  });
  return adminApp;
};

export const adminDb = (): Firestore => getFirestore(getAdminApp());
