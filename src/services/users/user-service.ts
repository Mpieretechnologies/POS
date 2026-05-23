import { doc, getDoc, type Firestore } from "firebase/firestore";
import { parseUserProfile, type UserProfile } from "@/services/users/user-profile";
import type { FirestoreUser, UserRole } from "@/types/user";

const USERS = "users";

export { mapRole } from "@/services/users/user-profile";

export const fetchUserProfile = async (
  db: Firestore,
  uid: string,
): Promise<UserProfile | null> => {
  const ref = doc(db, USERS, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return null;
  }
  return parseUserProfile(uid, snap.data() as Partial<FirestoreUser>);
};

export type { UserRole };
