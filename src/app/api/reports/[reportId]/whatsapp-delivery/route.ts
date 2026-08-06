import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { encryptSensitive, blindIndex } from "@/lib/data-encryption";
import { getPrisma } from "@/lib/db";
import { hashSecret } from "@/lib/owner-session";
import { viewerReportWhere } from "@/lib/report-access";

const paramsSchema = z.object({ reportId: z.string().uuid() });
const inputSchema = z.object({ phone: z.string().regex(/^\+[1-9]\d{7,14}$/), consent: z.literal(true) });

export async function GET(_: Request, context: { params: Promise<{ reportId: string }> }) {
  try {
    const { reportId } = paramsSchema.parse(await context.params);
    const access = await viewerReportWhere();
    if (!access) return NextResponse.json({ error: "Report not found" }, { status: 404 });
    const report = await getPrisma().report.findFirst({ where: { id: reportId, ...access, deletedAt: null }, select: { id: true } });
    if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });
    const delivery = await getPrisma().whatsappDelivery.findFirst({ where: { reportId }, orderBy: { createdAt: "desc" }, select: { id: true, status: true, createdAt: true, lastStatusAt: true, errorCode: true } });
    return NextResponse.json({ delivery }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Delivery status is unavailable" }, { status: 500 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ reportId: string }> }) {
  try {
    const { reportId } = paramsSchema.parse(await context.params);
    const { phone } = inputSchema.parse(await request.json());
    const access = await viewerReportWhere();
    if (!access) return NextResponse.json({ error: "Report not found" }, { status: 404 });
    const db = getPrisma();
    const report = await db.report.findFirst({ where: { id: reportId, ...access, entitlement: { isNot: null }, deletedAt: null } });
    if (!report) return NextResponse.json({ error: "Unlock the report before requesting delivery" }, { status: 403 });
    const phoneHash = blindIndex(phone);
    const existing = await db.whatsappDelivery.findFirst({ where: { reportId, phoneHash, status: { in: ["QUEUED", "SENT", "DELIVERED", "READ"] } }, orderBy: { createdAt: "desc" } });
    if (existing) return NextResponse.json({ delivery: { id: existing.id, status: existing.status } });

    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const templateName = process.env.WHATSAPP_TEMPLATE_NAME ?? "roastin_report_ready";
    const graphVersion = process.env.WHATSAPP_GRAPH_VERSION ?? "v26.0";
    if (!accessToken || !phoneNumberId) return NextResponse.json({ error: "WhatsApp delivery is not configured" }, { status: 503 });
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const encrypted = encryptSensitive(phone);
    const link = await db.shareLink.create({ data: { reportId, tokenHash: hashSecret(token), purpose: "DELIVERY", expiresAt } });
    const delivery = await db.whatsappDelivery.create({
      data: { reportId, shareLinkId: link.id, phoneCiphertext: encrypted.ciphertext, phoneIv: encrypted.iv, phoneTag: encrypted.tag, phoneHash, consentVersion: "whatsapp-delivery-v1", consentAt: new Date(), templateName, locale: report.locale },
    });
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
    const language = report.locale === "en" ? "en_US" : report.locale.replace("-", "_");
    const response = await fetch(`https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phone.replace("+", ""),
        type: "template",
        template: { name: templateName, language: { code: language }, components: [{ type: "body", parameters: [{ type: "text", text: `${origin}/s/${token}` }] }] },
      }),
      signal: AbortSignal.timeout(15_000),
    });
    const payload = await response.json() as { messages?: Array<{ id?: string }>; error?: { code?: number } };
    const providerMessageId = payload.messages?.[0]?.id;
    if (!response.ok || !providerMessageId) {
      await db.whatsappDelivery.update({ where: { id: delivery.id }, data: { status: "FAILED", errorCode: String(payload.error?.code ?? response.status), lastStatusAt: new Date() } });
      return NextResponse.json({ error: "WhatsApp could not accept the delivery" }, { status: 502 });
    }
    const sent = await db.whatsappDelivery.update({ where: { id: delivery.id }, data: { providerMessageId, status: "SENT", lastStatusAt: new Date() } });
    return NextResponse.json({ delivery: { id: sent.id, status: sent.status } }, { status: 202 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Enter a valid international number, for example +33612345678" }, { status: 400 });
    return NextResponse.json({ error: "WhatsApp delivery could not be created" }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ reportId: string }> }) {
  try {
    const { reportId } = paramsSchema.parse(await context.params);
    const access = await viewerReportWhere();
    if (!access) return NextResponse.json({ error: "Report not found" }, { status: 404 });
    const db = getPrisma();
    const report = await db.report.findFirst({ where: { id: reportId, ...access, deletedAt: null }, select: { id: true } });
    if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });
    await db.whatsappDelivery.updateMany({ where: { reportId }, data: { phoneCiphertext: null, phoneIv: null, phoneTag: null, phoneHash: null, status: "REVOKED", lastStatusAt: new Date() } });
    await db.shareLink.updateMany({ where: { reportId, purpose: "DELIVERY", revokedAt: null }, data: { revokedAt: new Date() } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "WhatsApp delivery data could not be removed" }, { status: 500 });
  }
}
