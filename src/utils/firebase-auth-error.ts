import { FirebaseError } from "firebase/app";

const CONFIGURATION_NOT_FOUND_HELP =
  "Firebase Authentication is not set up for this project yet, or your web config does not match the Firebase project. In Firebase Console → Project settings, copy the config from the same web app into .env.local. Open Authentication → Get started, then enable Email/Password. In Google Cloud Console → APIs, ensure Identity Toolkit API is enabled for this project.";

const FIRESTORE_PERMISSION_HELP =
  "Firestore denied the request. Deploy the security rules with `firebase deploy --only firestore:rules` from the project root, then make sure a `users/{your-uid}` document exists in Firestore.";

const authErrorCode = (error: unknown): string | undefined => {
  if (error instanceof FirebaseError) {
    return error.code;
  }
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code: unknown }).code;
    return typeof code === "string" ? code : undefined;
  }
  return undefined;
};

const messageLooksLikeConfigurationNotFound = (error: unknown): boolean => {
  if (!(error instanceof FirebaseError) && !(error instanceof Error)) {
    return false;
  }
  const m = error.message.toLowerCase();
  return m.includes("configuration-not-found") || m.includes("configuration_not_found");
};

const messageLooksLikeFirestorePermission = (error: unknown): boolean => {
  if (!(error instanceof FirebaseError) && !(error instanceof Error)) {
    return false;
  }
  const m = error.message.toLowerCase();
  return (
    m.includes("missing or insufficient permissions") ||
    m.includes("permission-denied") ||
    m.includes("permission_denied")
  );
};

export const formatAuthError = (error: unknown): string => {
  const code = authErrorCode(error);
  if (code) {
    switch (code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Invalid email or password.";
      case "auth/too-many-requests":
        return "Too many attempts. Try again later.";
      case "auth/invalid-email":
        return "Enter a valid email address.";
      case "auth/configuration-not-found":
        return CONFIGURATION_NOT_FOUND_HELP;
      case "auth/operation-not-allowed":
        return "Email/password sign-in is turned off. In Firebase Console → Authentication → Sign-in method, enable Email/Password.";
      case "permission-denied":
      case "firestore/permission-denied":
        return FIRESTORE_PERMISSION_HELP;
      default:
        if (messageLooksLikeConfigurationNotFound(error)) {
          return CONFIGURATION_NOT_FOUND_HELP;
        }
        if (messageLooksLikeFirestorePermission(error)) {
          return FIRESTORE_PERMISSION_HELP;
        }
        return error instanceof Error ? error.message : "Something went wrong. Please try again.";
    }
  }
  if (messageLooksLikeConfigurationNotFound(error)) {
    return CONFIGURATION_NOT_FOUND_HELP;
  }
  if (messageLooksLikeFirestorePermission(error)) {
    return FIRESTORE_PERMISSION_HELP;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
};
