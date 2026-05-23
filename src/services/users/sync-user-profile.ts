import type { User } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { doc, getDoc, serverTimestamp, setDoc, type Firestore } from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase/client";
import { parseUserProfile, type UserProfile } from "@/services/users/user-profile";

const USERS = "users";

const isFirestorePermissionError = (error: unknown): boolean => {
  if (error instanceof FirebaseError) {
    return error.code === "permission-denied";
  }
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("missing or insufficient permissions") ||
      message.includes("permission-denied") ||
      message.includes("permission_denied")
    );
  }
  return false;
};

const profileFromTokenEmail = async (user: User): Promise<string> => {
  const tokenResult = await user.getIdTokenResult();
  const claimEmail = tokenResult.claims.email;
  if (typeof claimEmail === "string" && claimEmail.trim()) {
    return claimEmail.trim().toLowerCase();
  }
  return (user.email ?? "").trim().toLowerCase();
};

const ensureUserProfileClient = async (
  db: Firestore,
  uid: string,
  email: string,
): Promise<UserProfile | null> => {
  const ref = doc(db, USERS, uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return parseUserProfile(uid, snap.data() as Partial<UserProfile>);
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return null;
  }

  await setDoc(ref, {
    email: normalizedEmail,
    role: "CASHIER",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    uid,
    email: normalizedEmail,
    role: "CASHIER",
  };
};

export const PROFILE_SETUP_HELP =
  "Your Firestore user profile could not be created. Do one of the following, then sign in again: (1) In Firebase Console → Firestore → Rules, paste the rules from firestore.rules in this repo and click Publish. (2) Add a service account to .env.local: Firebase Console → Project settings → Service accounts → Generate new private key, save the file as firebase-service-account.json in the project root, and set FIREBASE_SERVICE_ACCOUNT_PATH=firebase-service-account.json. Restart npm run dev after changing .env.local.";

export const syncUserProfile = async (user: User): Promise<UserProfile | null> => {
  const idToken = await user.getIdToken();
  const email = await profileFromTokenEmail(user);

  const response = await fetch("/api/auth/profile", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    credentials: "same-origin",
  });

  if (response.ok) {
    const data = (await response.json()) as UserProfile;
    return parseUserProfile(data.uid, data);
  }

  if (response.status !== 503) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Could not load user profile");
  }

  try {
    const db = firebaseDb();
    return await ensureUserProfileClient(db, user.uid, email);
  } catch (error) {
    if (isFirestorePermissionError(error)) {
      throw new Error(PROFILE_SETUP_HELP);
    }
    throw error;
  }
};
