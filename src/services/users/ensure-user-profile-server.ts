import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { parseUserProfile, type UserProfile } from "@/services/users/user-profile";

const USERS = "users";

export const ensureUserProfileServer = async (
  uid: string,
  email: string,
): Promise<UserProfile | null> => {
  const ref = adminDb().collection(USERS).doc(uid);
  const snap = await ref.get();

  if (snap.exists) {
    return parseUserProfile(uid, snap.data() as Partial<UserProfile>);
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return null;
  }

  await ref.set({
    email: normalizedEmail,
    role: "CASHIER",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return {
    uid,
    email: normalizedEmail,
    role: "CASHIER",
  };
};
