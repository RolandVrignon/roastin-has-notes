import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { reportSchema } from "@/domain/report";
import { getPrisma } from "@/lib/db";
import { viewerReportWhere } from "@/lib/report-access";
import { fulfillCheckout } from "@/lib/stripe-fulfillment";

const paramsSchema = z.object({ reportId: z.string().uuid() });

async function verifyCheckout(reportId: string, sessionId: string) {
  if (!process.env.STRIPE_SECRET_KEY) return;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const session = await stripe.checkout.sessions.retrieve(sessionId);
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
    const report = await getPrisma().report.findFirst({ where: { id: reportId, ...access, deletedAt: null, status: "READY" }, include: { entitlement: true } });
    if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });
    const unlocked = Boolean(report.entitlement);
    const payload = reportSchema.parse(unlocked ? report.content : report.preview);
    return NextResponse.json({ report: payload, unlocked, canManage: true }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ reportId: string }> }) {
  try {
    const { reportId } = paramsSchema.parse(await context.params);
    const access = await viewerReportWhere();
    if (!access) return NextResponse.json({ error: "Report not found" }, { status: 404 });
    const result = await getPrisma().report.updateMany({
      where: { id: reportId, ...access, deletedAt: null },
      data: { deletedAt: new Date(), status: "DELETED", preview: undefined, content: undefined },
    });
    if (!result.count) return NextResponse.json({ error: "Report not found" }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Report could not be deleted" }, { status: 500 });
  }
}
