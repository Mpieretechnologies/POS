import { createRemoteJWKSet, jwtVerify } from "jose";

const JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  ),
);

export async function verifyFirebaseIdToken(
  token: string,
  projectId: string,
): Promise<{ uid: string; email?: string }> {
  const issuer = `https://securetoken.google.com/${projectId}`;
  const { payload } = await jwtVerify(token, JWKS, {
    issuer,
    audience: projectId,
  });

  const uid = typeof payload.sub === "string" ? payload.sub : "";
  if (!uid) {
    throw new Error("Invalid token subject");
  }

  const email =
    typeof payload.email === "string" ? payload.email : undefined;

  return { uid, email };
}
