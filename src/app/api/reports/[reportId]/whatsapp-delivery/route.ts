import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma } from "@/lib/db";
import { viewerReportWhere } from "@/lib/report-access";
import { deliverPaidReport } from "@/lib/whatsapp-delivery";

const paramsSchema = z.object({ reportId: z.string().uuid() });

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
    const access = await viewerReportWhere();
    if (!access) return NextResponse.json({ error: "Report not found" }, { status: 404 });
    const db = getPrisma();
    const report = await db.report.findFirst({ where: { id: reportId, ...access, entitlement: { isNot: null }, deletedAt: null, userId: { not: null } } });
    if (!report) return NextResponse.json({ error: "Unlock the report before requesting delivery" }, { status: 403 });
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
    const delivery = await deliverPaidReport(reportId, origin);
    if (!delivery) return NextResponse.json({ error: "WhatsApp delivery is unavailable for this report" }, { status: 409 });
    return NextResponse.json({ delivery }, { status: 202 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid report" }, { status: 400 });
    if (error instanceof Error && error.message === "WHATSAPP_NOT_CONFIGURED") return NextResponse.json({ error: "WhatsApp delivery is not configured" }, { status: 503 });
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
