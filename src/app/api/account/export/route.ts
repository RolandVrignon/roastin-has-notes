import { NextResponse } from "next/server";
import { decryptSensitive } from "@/lib/data-encryption";
import { getPrisma } from "@/lib/db";
import { readUserSession } from "@/lib/user-session";

export async function GET() {
  const session = await readUserSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const reports = await getPrisma().report.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, chatName: true, locale: true, status: true, content: true,
      messageCount: true, participantCount: true, model: true, generationCostUsd: true, generationCostEur: true,
      usdToEurRate: true, exchangeRateDate: true, exchangeRateSource: true,
      paidAt: true, rawDeletedAt: true, deletedAt: true, createdAt: true,
      payments: { select: { status: true, amount: true, currency: true, createdAt: true } },
      shareLinks: { select: { purpose: true, expiresAt: true, revokedAt: true, createdAt: true } },
      deliveries: { select: { status: true, consentVersion: true, consentAt: true, templateName: true, locale: true, lastStatusAt: true, createdAt: true } },
    },
  });
  const phone = decryptSensitive({ ciphertext: session.user.phoneCiphertext, iv: session.user.phoneIv, tag: session.user.phoneTag });
  return NextResponse.json({ exportedAt: new Date().toISOString(), account: { whatsappNumber: phone, whatsappConsentVersion: session.user.whatsappConsentVersion, whatsappConsentAt: session.user.whatsappConsentAt, createdAt: session.user.createdAt }, reports }, {
    headers: { "Cache-Control": "private, no-store", "Content-Disposition": `attachment; filename="roastin-data-${new Date().toISOString().slice(0, 10)}.json"` },
  });
}
