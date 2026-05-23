const t = (value: string | undefined): string => (value ?? "").trim();

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    t(process.env.NEXT_PUBLIC_FIREBASE_API_KEY) &&
      t(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) &&
      t(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) &&
      t(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) &&
      t(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) &&
      t(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
  );
};
