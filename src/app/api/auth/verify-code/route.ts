import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma } from "@/lib/db";
import { readOwnerHash } from "@/lib/owner-session";
import { hashOtp } from "@/lib/otp";
import { createUserSession } from "@/lib/user-session";

const inputSchema = z.object({ email: z.email().max(254).transform((email) => email.toLowerCase()), code: z.string().regex(/^\d{6}$/) });

export async function POST(request: Request) {
  try {
    const { email, code } = inputSchema.parse(await request.json());
    const db = getPrisma();
    const otp = await db.otpCode.findFirst({ where: { email, codeHash: hashOtp(email, code), usedAt: null, expiresAt: { gt: new Date() } }, orderBy: { createdAt: "desc" } });
    if (!otp) return NextResponse.json({ error: "This code is invalid or expired" }, { status: 401 });
    const ownerTokenHash = await readOwnerHash();
    const user = await db.$transaction(async (tx) => {
      await tx.otpCode.update({ where: { id: otp.id }, data: { usedAt: new Date() } });
      const saved = await tx.user.upsert({ where: { email }, create: { email }, update: {} });
      if (ownerTokenHash) await tx.report.updateMany({ where: { ownerTokenHash, userId: null }, data: { userId: saved.id } });
      return saved;
    }, { isolationLevel: "Serializable" });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(await createUserSession(user.id));
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Enter the six-digit code" }, { status: 400 });
    return NextResponse.json({ error: "Sign-in could not be completed" }, { status: 500 });
  }
}
