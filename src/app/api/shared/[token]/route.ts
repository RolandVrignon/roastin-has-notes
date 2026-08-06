import { NextResponse } from "next/server";
import { z } from "zod";
import { reportSchema } from "@/domain/report";
import { getPrisma } from "@/lib/db";
import { hashSecret } from "@/lib/owner-session";
import { prepareSharedReport } from "@/lib/shared-report";

const paramsSchema = z.object({ token: z.string().min(20).max(100) });

export async function GET(_: Request, context: { params: Promise<{ token: string }> }) {
  try {
    const { token } = paramsSchema.parse(await context.params);
    const link = await getPrisma().shareLink.findFirst({
      where: { tokenHash: hashSecret(token), revokedAt: null, expiresAt: { gt: new Date() }, report: { deletedAt: null, entitlement: { isNot: null }, status: "READY" } },
      include: { report: true },
    });
    if (!link?.report.content) return NextResponse.json({ error: "This share link has expired or was revoked" }, { status: 404 });
    const report = prepareSharedReport(reportSchema.parse(link.report.content), link);
    return NextResponse.json({ report, expiresAt: link.expiresAt.toISOString() }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "This share link has expired or was revoked" }, { status: 404 });
  }
}
