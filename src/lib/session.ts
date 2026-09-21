import { SignJWT, jwtVerify } from "jose";

/**
 * Edge-safe session helpers (JWT sign/verify only — no next/headers, no
 * bcrypt). This file is imported by middleware.ts, which runs on the Edge
 * runtime, so keep it free of Node-only APIs.
 */

export const SESSION_COOKIE = "appcom_session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30; // 30 days

export type Role = "member" | "coach";

export type SessionPayload = {
  sub: string; // user id
  email: string;
  name: string;
  role: Role;
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET is not set. Add it to your .env.local (local dev) or your Vercel project's Environment Variables (production)."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(
  payload: SessionPayload
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.sub === "string" &&
      typeof payload.email === "string" &&
      typeof payload.name === "string" &&
      (payload.role === "member" || payload.role === "coach")
    ) {
      return {
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      };
    }
    return null;
  } catch {
    return null;
  }
}
