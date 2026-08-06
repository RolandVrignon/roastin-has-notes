import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "roastin_owner";

export function hashSecret(secret: string) {
  return createHash("sha256").update(secret).digest("hex");
}

export async function getOrCreateOwnerSession() {
  const store = await cookies();
  const existing = store.get(COOKIE_NAME)?.value;
  if (existing) return { token: existing, hash: hashSecret(existing), isNew: false };
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashSecret(token), isNew: true };
}

export async function readOwnerHash() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  return token ? hashSecret(token) : null;
}

export function ownerCookie(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  };
}
