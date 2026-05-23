import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

let app: FirebaseApp | undefined;

const t = (value: string | undefined): string => (value ?? "").trim();

const readConfig = () => {
  const measurementId = t(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID);
  return {
    apiKey: t(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    authDomain: t(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
    projectId: t(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
    storageBucket: t(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: t(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
    appId: t(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
    ...(measurementId ? { measurementId } : {}),
  };
};

export const getFirebaseApp = (): FirebaseApp => {
  if (app) {
    return app;
  }
  if (!getApps().length) {
    const config = readConfig();
    if (
      !config.apiKey ||
      !config.authDomain ||
      !config.projectId ||
      !config.storageBucket ||
      !config.messagingSenderId ||
      !config.appId
    ) {
      throw new Error(
        "Firebase is not configured. Copy .env.local.example to .env.local and set all NEXT_PUBLIC_FIREBASE_* values.",
      );
    }
    app = initializeApp(config);
    return app;
  }
  app = getApp();
  return app;
};

export const firebaseAuth = () => getAuth(getFirebaseApp());
export const firebaseDb = () => getFirestore(getFirebaseApp());
export const firebaseStorage = () => getStorage(getFirebaseApp());
