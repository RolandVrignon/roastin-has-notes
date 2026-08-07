import { randomBytes } from "node:crypto";
import { decryptSensitive } from "@/lib/data-encryption";
import { getPrisma } from "@/lib/db";
import { classicOfferCodes } from "@/lib/entitlements";
import { hashSecret } from "@/lib/owner-session";
import { sendWhatsappTemplate, whatsappLanguage } from "@/lib/whatsapp-cloud";

const activeStatuses = ["QUEUED", "SENT", "DELIVERED", "READ"] as const;

export async function deliverPaidReport(reportId: string, origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000") {
  const db = getPrisma();
  const report = await db.report.findFirst({
    where: { id: reportId, entitlements: { some: { offerCode: { in: [...classicOfferCodes] } } }, deletedAt: null, userId: { not: null } },
    select: {
      id: true,
      locale: true,
      user: {
        select: {
          phoneCiphertext: true,
          phoneIv: true,
          phoneTag: true,
          phoneHash: true,
          whatsappConsentAt: true,
          whatsappConsentVersion: true,
        },
      },
    },
  });
  if (!report?.user) return null;

  const existing = await db.whatsappDelivery.findFirst({
    where: { reportId, phoneHash: report.user.phoneHash, status: { in: [...activeStatuses] } },
    orderBy: { createdAt: "desc" },
    select: { id: true, status: true },
  });
  if (existing) return existing;

  const phone = decryptSensitive({
    ciphertext: report.user.phoneCiphertext,
    iv: report.user.phoneIv,
    tag: report.user.phoneTag,
  });
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const templateName = process.env.WHATSAPP_REPORT_TEMPLATE_NAME ?? "roastin_report_ready";
  const link = await db.shareLink.create({
    data: { reportId, tokenHash: hashSecret(token), purpose: "DELIVERY", expiresAt },
  });
  const delivery = await db.whatsappDelivery.create({
    data: {
      reportId,
      shareLinkId: link.id,
      phoneCiphertext: report.user.phoneCiphertext,
      phoneIv: report.user.phoneIv,
      phoneTag: report.user.phoneTag,
      phoneHash: report.user.phoneHash,
      consentVersion: report.user.whatsappConsentVersion,
      consentAt: report.user.whatsappConsentAt,
      templateName,
      locale: report.locale,
    },
  });

  try {
    const reportUrl = new URL(`/s/${token}`, origin).toString();
    const { providerMessageId } = await sendWhatsappTemplate({
      phone,
      templateName,
      languageCode: process.env.WHATSAPP_REPORT_TEMPLATE_LANGUAGE ?? whatsappLanguage(report.locale),
      components: [{ type: "body", parameters: [{ type: "text", text: reportUrl }] }],
    });
    return db.whatsappDelivery.update({
      where: { id: delivery.id },
      data: { providerMessageId, status: "SENT", lastStatusAt: new Date() },
      select: { id: true, status: true },
    });
  } catch (error) {
    const providerCode = error instanceof Error && "providerCode" in error ? String(error.providerCode) : "SEND_FAILED";
    await db.$transaction([
      db.whatsappDelivery.update({
        where: { id: delivery.id },
        data: { status: "FAILED", errorCode: providerCode, lastStatusAt: new Date(), phoneCiphertext: null, phoneIv: null, phoneTag: null, phoneHash: null },
      }),
      db.shareLink.update({ where: { id: link.id }, data: { revokedAt: new Date() } }),
    ]);
    throw error;
  }
}
