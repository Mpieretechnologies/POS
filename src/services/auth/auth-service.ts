import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  onIdTokenChanged,
  type User,
  type Unsubscribe,
} from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";

export const signInWithEmail = async (
  email: string,
  password: string,
): Promise<User> => {
  const auth = firebaseAuth();
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
};

export const signOutUser = async (): Promise<void> => {
  const auth = firebaseAuth();
  await signOut(auth);
};

export const subscribeAuthState = (handler: (user: User | null) => void): Unsubscribe => {
  return onAuthStateChanged(firebaseAuth(), handler);
};

export const subscribeIdTokenChanges = (handler: (user: User | null) => void): Unsubscribe => {
  return onIdTokenChanged(firebaseAuth(), handler);
};

export const getCurrentUserIdToken = async (user: User | null): Promise<string | null> => {
  if (!user) {
    return null;
  }
  return await user.getIdToken();
};
