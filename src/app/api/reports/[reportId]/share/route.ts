import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma } from "@/lib/db";
import { hashSecret } from "@/lib/owner-session";
import { viewerReportWhere } from "@/lib/report-access";

const paramsSchema = z.object({ reportId: z.string().uuid() });

export async function POST(request: Request, context: { params: Promise<{ reportId: string }> }) {
  try {
    const { reportId } = paramsSchema.parse(await context.params);
    const access = await viewerReportWhere();
    if (!access) return NextResponse.json({ error: "Report not found" }, { status: 404 });
    const db = getPrisma();
    const report = await db.report.findFirst({ where: { id: reportId, ...access, entitlement: { isNot: null }, deletedAt: null } });
    if (!report) return NextResponse.json({ error: "Unlock the report before sharing it" }, { status: 403 });
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.shareLink.create({ data: { reportId, tokenHash: hashSecret(token), expiresAt } });
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
    return NextResponse.json({ shareUrl: `${origin}/s/${token}`, expiresAt: expiresAt.toISOString() }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Share link could not be created" }, { status: 500 });
  }
}
