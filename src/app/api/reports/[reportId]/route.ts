import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { reportSchema } from "@/domain/report";
import { getPrisma } from "@/lib/db";
import { hasEntitlement } from "@/lib/entitlements";
import { viewerReportWhere } from "@/lib/report-access";
import { publicOfferForLocale } from "@/lib/offers";
import { fulfillCheckout } from "@/lib/stripe-fulfillment";
import { getStripe } from "@/lib/stripe";
import { deleteEphemeralPayload } from "@/server/storage/ephemeral-payload";
import { requestGenerationDeletion } from "@/temporal/client";

const paramsSchema = z.object({ reportId: z.string().uuid() });

async function verifyCheckout(reportId: string, sessionId: string) {
  if (!process.env.STRIPE_SECRET_KEY) return;
  const session = await getStripe().checkout.sessions.retrieve(sessionId);
  if (session.client_reference_id !== reportId || session.payment_status !== "paid") return;
  await fulfillCheckout(session);
}

export async function GET(request: Request, context: { params: Promise<{ reportId: string }> }) {
  try {
    const { reportId } = paramsSchema.parse(await context.params);
    const access = await viewerReportWhere();
    if (!access) return NextResponse.json({ error: "Report not found" }, { status: 404 });
    const sessionId = new URL(request.url).searchParams.get("session_id");
    if (sessionId) await verifyCheckout(reportId, sessionId);
    const report = await getPrisma().report.findFirst({
      where: { id: reportId, ...access, deletedAt: null, status: "READY" },
      include: { entitlements: { select: { offerCode: true } } },
    });
    if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });
    const unlocked = hasEntitlement(report.entitlements, "classic");
    const quizUnlocked = hasEntitlement(report.entitlements, "quiz");
    const payload = reportSchema.parse(unlocked ? report.content : report.preview);
    return NextResponse.json({ report: payload, unlocked, quizUnlocked, canManage: true, offer: publicOfferForLocale(report.locale), quizOffer: publicOfferForLocale(report.locale, "quiz") }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ reportId: string }> }) {
  try {
    const { reportId } = paramsSchema.parse(await context.params);
    const access = await viewerReportWhere();
    if (!access) return NextResponse.json({ error: "Report not found" }, { status: 404 });
    const db = getPrisma();
    const report = await db.report.findFirst({
      where: { id: reportId, ...access, deletedAt: null },
      select: { id: true, workflowId: true, payloadReference: true },
    });
    if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

    await Promise.allSettled([
      report.workflowId ? requestGenerationDeletion(report.workflowId) : Promise.resolve(),
      report.payloadReference ? deleteEphemeralPayload(report.payloadReference) : Promise.resolve(),
    ]);

    await db.$transaction(async (tx) => {
      await tx.shareLink.updateMany({ where: { reportId, revokedAt: null }, data: { revokedAt: new Date() } });
      await tx.whatsappDelivery.updateMany({
        where: { reportId },
        data: { phoneCiphertext: null, phoneIv: null, phoneTag: null, phoneHash: null, status: "REVOKED", lastStatusAt: new Date() },
      });
      await tx.generationArtifact.deleteMany({ where: { reportId } });
      await tx.report.update({
        where: { id: reportId },
        data: {
          ownerTokenHash: "deleted",
          userId: null,
          chatName: "Deleted report",
          status: "DELETED",
          preview: Prisma.DbNull,
          content: Prisma.DbNull,
          messageCount: 0,
          participantCount: 0,
          dateRange: null,
          publicErrorCode: null,
          payloadReference: null,
          payloadExpiresAt: null,
          rawDeletedAt: new Date(),
          deletedAt: new Date(),
        },
      });
    }, { isolationLevel: "Serializable" });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Report could not be deleted" }, { status: 500 });
  }
}
