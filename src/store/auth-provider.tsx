"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { User } from "firebase/auth";
import { isFirebaseConfigured } from "@/lib/firebase/config-status";
import {
  getCurrentUserIdToken,
  signInWithEmail,
  signOutUser,
  subscribeAuthState,
  subscribeIdTokenChanges,
} from "@/services/auth/auth-service";
import { syncSessionCookie } from "@/services/auth/session-sync";
import { syncUserProfile } from "@/services/users/sync-user-profile";
import type { AppUser } from "@/types/user";
import { formatAuthError } from "@/utils/firebase-auth-error";

export type AuthContextValue = {
  firebaseUser: User | null;
  appUser: AppUser | null;
  loading: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
  signOutApp: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const authUidRef = useRef<string | null>(null);
  const hasResolvedAuthRef = useRef(false);

  const loadProfile = useCallback(async (user: User | null) => {
    if (!user) {
      setAppUser(null);
      return;
    }
    const profile = await syncUserProfile(user);
    if (!profile) {
      setAppUser(null);
      setAuthError(
        "Your account profile is missing or invalid. Ask an administrator to check Firestore users/{uid}.",
      );
      return;
    }
    setAuthError(null);
    setAppUser({
      uid: profile.uid,
      email: profile.email,
      role: profile.role,
      displayName: profile.displayName,
    });
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false);
      setAuthError(
        "Firebase is not configured. Copy .env.local.example to .env.local and set your web app keys.",
      );
      return;
    }

    let active = true;
    const unsubscribe = subscribeAuthState((user) => {
      const nextUid = user?.uid ?? null;
      const isInitialAuthEvent = !hasResolvedAuthRef.current;
      const uidChanged = authUidRef.current !== nextUid;
      hasResolvedAuthRef.current = true;
      authUidRef.current = nextUid;

      setFirebaseUser(user);
      void (async () => {
        if (isInitialAuthEvent || uidChanged) {
          setLoading(true);
        }
        try {
          if (user) {
            await loadProfile(user);
            const token = await user.getIdToken();
            await syncSessionCookie(token);
          } else {
            setAppUser(null);
            await syncSessionCookie(null);
          }
        } catch (error) {
          if (user && active) {
            setAuthError(formatAuthError(error));
          }
        } finally {
          if (active && (isInitialAuthEvent || uidChanged)) {
            setLoading(false);
          }
        }
      })();
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [loadProfile]);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      return;
    }

    const unsubscribe = subscribeIdTokenChanges((user) => {
      void (async () => {
        const token = await getCurrentUserIdToken(user);
        await syncSessionCookie(token);
      })();
    });
    return () => unsubscribe();
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const signInWithEmailPassword = useCallback(
    async (email: string, password: string) => {
      setAuthError(null);
      if (!isFirebaseConfigured()) {
        const message =
          "Firebase is not configured. Copy .env.local.example to .env.local and set your web app keys.";
        setAuthError(message);
        throw new Error(message);
      }
      try {
        const user = await signInWithEmail(email, password);
        const token = await user.getIdToken();
        await syncSessionCookie(token);
        setFirebaseUser(user);
        await loadProfile(user);
      } catch (error) {
        setAuthError(formatAuthError(error));
        throw error;
      }
    },
    [loadProfile],
  );

  const signOutApp = useCallback(async () => {
    setAuthError(null);
    try {
      await syncSessionCookie(null);
      await signOutUser();
    } finally {
      setAppUser(null);
      setFirebaseUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      firebaseUser,
      appUser,
      loading,
      authError,
      clearAuthError,
      signInWithEmailPassword,
      signOutApp,
    }),
    [
      firebaseUser,
      appUser,
      loading,
      authError,
      clearAuthError,
      signInWithEmailPassword,
      signOutApp,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
