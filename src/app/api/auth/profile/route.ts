import { NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/auth/verify-firebase-id-token";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { getFirebaseProjectId } from "@/lib/firebase/env";
import { ensureUserProfileServer } from "@/services/users/ensure-user-profile-server";

const bearerToken = (request: Request): string => {
  const header = request.headers.get("authorization") ?? "";
  if (header.startsWith("Bearer ")) {
    return header.slice("Bearer ".length).trim();
  }
  return "";
};

export async function POST(request: Request): Promise<Response> {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json(
      {
        error:
          "Server profile bootstrap is not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON in .env.local, or deploy firestore.rules and rely on client profile creation.",
      },
      { status: 503 },
    );
  }

  const projectId = getFirebaseProjectId();
  if (!projectId) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const idToken = bearerToken(request);
  if (!idToken) {
    return NextResponse.json({ error: "Authorization bearer token is required" }, { status: 401 });
  }

  let uid: string;
  let email: string | undefined;
  try {
    ({ uid, email } = await verifyFirebaseIdToken(idToken, projectId));
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  try {
    const profile = await ensureUserProfileServer(uid, email ?? "");
    if (!profile) {
      return NextResponse.json({ error: "Could not create user profile" }, { status: 400 });
    }

    return NextResponse.json({
      uid: profile.uid,
      email: profile.email,
      role: profile.role,
      displayName: profile.displayName,
    });
  } catch {
    return NextResponse.json({ error: "Could not load user profile" }, { status: 500 });
  }
}
