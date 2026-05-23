import { NextResponse, type NextRequest } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/auth/verify-firebase-id-token";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { getFirebaseProjectId } from "@/lib/firebase/env";

const LOGIN_PATH = "/login";
const DASHBOARD_PREFIX = "/dashboard";

const getSafeReturnPath = (raw: string | null): string => {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return DASHBOARD_PREFIX;
  }
  return raw;
};

const isSessionValid = async (token: string, projectId: string): Promise<boolean> => {
  try {
    await verifyFirebaseIdToken(token, projectId);
    return true;
  } catch {
    return false;
  }
};

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const projectId = getFirebaseProjectId();
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value ?? "";

  const sessionOk =
    Boolean(projectId) && token.length > 0 && (await isSessionValid(token, projectId));

  if (pathname === LOGIN_PATH || pathname.startsWith(`${LOGIN_PATH}/`)) {
    if (sessionOk) {
      const target = getSafeReturnPath(request.nextUrl.searchParams.get("from"));
      return NextResponse.redirect(new URL(target, request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith(DASHBOARD_PREFIX)) {
    if (!sessionOk) {
      const loginUrl = new URL(LOGIN_PATH, request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/login/:path*", "/dashboard/:path*"],
};
