import { NextResponse } from "next/server";
import { z } from "zod";
import { blindIndex } from "@/lib/data-encryption";
import { getPrisma } from "@/lib/db";
import { createOtp, hashOtp, sendOtpWhatsapp } from "@/lib/otp";
import { phoneSchema } from "@/lib/phone";

const inputSchema = z.object({ phone: phoneSchema, consent: z.literal(true) });

export async function POST(request: Request) {
  try {
    const { phone } = inputSchema.parse(await request.json());
    const phoneHash = blindIndex(phone);
    const db = getPrisma();
    const recentCount = await db.otpCode.count({ where: { phoneHash, createdAt: { gt: new Date(Date.now() - 10 * 60 * 1000) } } });
    if (recentCount >= 3) return NextResponse.json({ error: "Too many codes requested. Try again later." }, { status: 429 });
    const code = createOtp();
    const otp = await db.otpCode.create({ data: { phoneHash, codeHash: hashOtp(phoneHash, code), expiresAt: new Date(Date.now() + 10 * 60 * 1000) } });
    try {
      const sent = await sendOtpWhatsapp(phone, code);
      return NextResponse.json({ ok: true, ...sent });
    } catch {
      await db.otpCode.delete({ where: { id: otp.id } });
      return NextResponse.json({ error: "The WhatsApp sign-in code could not be sent" }, { status: 502 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Enter a valid international WhatsApp number and accept messaging" }, { status: 400 });
    return NextResponse.json({ error: "A sign-in code could not be created" }, { status: 500 });
  }
}
