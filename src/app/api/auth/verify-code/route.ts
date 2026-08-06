import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma } from "@/lib/db";
import { readOwnerHash } from "@/lib/owner-session";
import { hashOtp } from "@/lib/otp";
import { createUserSession } from "@/lib/user-session";

const inputSchema = z.object({ email: z.email().max(254).transform((email) => email.toLowerCase()), code: z.string().regex(/^\d{6}$/) });
const maximumAttempts = 5;

function hashesMatch(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

class InvalidOtpError extends Error {}

export async function POST(request: Request) {
  try {
    const { email, code } = inputSchema.parse(await request.json());
    const db = getPrisma();
    const otp = await db.otpCode.findFirst({
      where: { email, usedAt: null, lockedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
    if (!otp) return NextResponse.json({ error: "This code is invalid or expired" }, { status: 401 });
    if (!hashesMatch(otp.codeHash, hashOtp(email, code))) {
      const nextAttempt = otp.attempts + 1;
      await db.otpCode.updateMany({
        where: { id: otp.id, usedAt: null, lockedAt: null, attempts: { lt: maximumAttempts } },
        data: { attempts: { increment: 1 }, ...(nextAttempt >= maximumAttempts ? { lockedAt: new Date() } : {}) },
      });
      return NextResponse.json({ error: "This code is invalid or expired" }, { status: 401 });
    }
    const ownerTokenHash = await readOwnerHash();
    const user = await db.$transaction(async (tx) => {
      const consumed = await tx.otpCode.updateMany({
        where: { id: otp.id, usedAt: null, lockedAt: null, expiresAt: { gt: new Date() } },
        data: { usedAt: new Date() },
      });
      if (consumed.count !== 1) throw new InvalidOtpError();
      const saved = await tx.user.upsert({ where: { email }, create: { email }, update: {} });
      if (ownerTokenHash) await tx.report.updateMany({ where: { ownerTokenHash, userId: null }, data: { userId: saved.id } });
      return saved;
    }, { isolationLevel: "Serializable" });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(await createUserSession(user.id));
    response.cookies.set({ name: "roastin_owner", value: "", path: "/", maxAge: 0 });
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Enter the six-digit code" }, { status: 400 });
    if (error instanceof InvalidOtpError) return NextResponse.json({ error: "This code is invalid or expired" }, { status: 401 });
    return NextResponse.json({ error: "Sign-in could not be completed" }, { status: 500 });
  }
}
