import { NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/auth/verify-firebase-id-token";
import {
  SESSION_COOKIE_MAX_AGE_SECONDS,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/constants";
import { getFirebaseProjectId } from "@/lib/firebase/env";

type SessionBody = {
  idToken?: unknown;
};

const secureCookie = process.env.NODE_ENV === "production";

export async function POST(request: Request): Promise<Response> {
  const projectId = getFirebaseProjectId();
  if (!projectId) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  let body: SessionBody;
  try {
    body = (await request.json()) as SessionBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const idToken = typeof body.idToken === "string" ? body.idToken : "";
  if (!idToken) {
    return NextResponse.json({ error: "idToken is required" }, { status: 400 });
  }

  try {
    await verifyFirebaseIdToken(idToken, projectId);
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, idToken, {
    httpOnly: true,
    secure: secureCookie,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
  });
  return response;
}

export async function DELETE(): Promise<Response> {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: secureCookie,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
