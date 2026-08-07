import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma } from "@/lib/db";
import { classicOfferCodes } from "@/lib/entitlements";
import { hashSecret } from "@/lib/owner-session";
import { viewerReportWhere } from "@/lib/report-access";

const paramsSchema = z.object({ reportId: z.string().uuid() });
const createSchema = z.object({
  anonymizeNames: z.boolean().default(false),
  hideQuotes: z.boolean().default(false),
});

export async function GET(_: Request, context: { params: Promise<{ reportId: string }> }) {
  try {
    const { reportId } = paramsSchema.parse(await context.params);
    const access = await viewerReportWhere();
    if (!access) return NextResponse.json({ error: "Report not found" }, { status: 404 });
    const db = getPrisma();
    const report = await db.report.findFirst({ where: { id: reportId, ...access, deletedAt: null }, select: { id: true } });
    if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });
    const links = await db.shareLink.findMany({
      where: { reportId, purpose: "SHARING", revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true, expiresAt: true, anonymizeNames: true, hideQuotes: true },
    });
    return NextResponse.json({ links }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Share links are unavailable" }, { status: 500 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ reportId: string }> }) {
  try {
    const { reportId } = paramsSchema.parse(await context.params);
    const privacy = createSchema.parse(await request.json().catch(() => ({})));
    const access = await viewerReportWhere();
    if (!access) return NextResponse.json({ error: "Report not found" }, { status: 404 });
    const db = getPrisma();
    const report = await db.report.findFirst({ where: { id: reportId, ...access, entitlements: { some: { offerCode: { in: [...classicOfferCodes] } } }, deletedAt: null } });
    if (!report) return NextResponse.json({ error: "Unlock the report before sharing it" }, { status: 403 });
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.shareLink.create({ data: { reportId, tokenHash: hashSecret(token), expiresAt, ...privacy } });
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
    return NextResponse.json({ shareUrl: `${origin}/s/${token}`, expiresAt: expiresAt.toISOString() }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Share link could not be created" }, { status: 500 });
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
    const result = await db.shareLink.updateMany({ where: { reportId, purpose: "SHARING", revokedAt: null }, data: { revokedAt: new Date() } });
    return NextResponse.json({ revoked: result.count });
  } catch {
    return NextResponse.json({ error: "Share links could not be revoked" }, { status: 500 });
  }
}
