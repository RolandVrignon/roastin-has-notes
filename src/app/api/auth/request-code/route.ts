import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma } from "@/lib/db";
import { createOtp, hashOtp, sendOtpEmail } from "@/lib/otp";

const inputSchema = z.object({ email: z.email().max(254).transform((email) => email.toLowerCase()) });

export async function POST(request: Request) {
  try {
    const { email } = inputSchema.parse(await request.json());
    const db = getPrisma();
    const recentCount = await db.otpCode.count({ where: { email, createdAt: { gt: new Date(Date.now() - 10 * 60 * 1000) } } });
    if (recentCount >= 3) return NextResponse.json({ error: "Too many codes requested. Try again later." }, { status: 429 });
    const code = createOtp();
    const otp = await db.otpCode.create({ data: { email, codeHash: hashOtp(email, code), expiresAt: new Date(Date.now() + 10 * 60 * 1000) } });
    try {
      const sent = await sendOtpEmail(email, code);
      return NextResponse.json({ ok: true, ...sent });
    } catch {
      await db.otpCode.delete({ where: { id: otp.id } });
      return NextResponse.json({ error: "The sign-in email could not be sent" }, { status: 502 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    return NextResponse.json({ error: "A sign-in code could not be created" }, { status: 500 });
  }
}
