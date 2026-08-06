import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { getPrisma } from "@/lib/db";
import { hashSecret } from "@/lib/owner-session";

const COOKIE_NAME = "roastin_session";

export async function createUserSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await getPrisma().session.create({ data: { userId, tokenHash: hashSecret(token), expiresAt } });
  return { name: COOKIE_NAME, value: token, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", expires: expiresAt };
}

export async function readUserSession() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  return getPrisma().session.findFirst({ where: { tokenHash: hashSecret(token), expiresAt: { gt: new Date() } }, include: { user: true } });
}
