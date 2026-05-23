import { FirebaseError } from "firebase/app";
import { formatAuthError } from "@/utils/firebase-auth-error";

const STORAGE_PERMISSION_HELP =
  "Storage access was denied. Deploy storage rules and ensure you have the correct role.";

const errorCode = (error: unknown): string | undefined => {
  if (error instanceof FirebaseError) {
    return error.code;
  }
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code: unknown }).code;
    return typeof code === "string" ? code : undefined;
  }
  return undefined;
};

export const formatFirebaseError = (error: unknown): string => {
  const code = errorCode(error);

  if (code === "storage/unauthorized" || code === "storage/unauthenticated") {
    return STORAGE_PERMISSION_HELP;
  }

  if (code === "not-found") {
    return "The requested item was not found.";
  }

  if (code === "already-exists") {
    return "An item with this identifier already exists.";
  }

  if (code === "failed-precondition") {
    if (error instanceof Error && error.message.trim().length > 0) {
      return error.message;
    }
    return "Firestore index required for this report query. Deploy indexes with firebase deploy --only firestore:indexes.";
  }

  if (code === "permission-denied") {
    return "You do not have permission to read these sales records. Check your role and Firestore rules.";
  }

  return formatAuthError(error);
};
