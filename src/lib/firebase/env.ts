export const getFirebaseProjectId = (): string => {
  return (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "").trim();
};
