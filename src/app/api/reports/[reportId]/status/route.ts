import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma } from "@/lib/db";
import { viewerReportWhere } from "@/lib/report-access";

const paramsSchema = z.object({ reportId: z.string().uuid() });

const progressByStage = {
  QUEUED: 5,
  VALIDATING: 15,
  ANALYZING: 40,
  DRAFTING: 70,
  FINALIZING: 90,
  READY: 100,
  FAILED: 100,
} as const;

export async function GET(_: Request, context: { params: Promise<{ reportId: string }> }) {
  try {
    const { reportId } = paramsSchema.parse(await context.params);
    const access = await viewerReportWhere();
    if (!access) return NextResponse.json({ error: "Report not found" }, { status: 404 });
    const report = await getPrisma().report.findFirst({
      where: { id: reportId, ...access, deletedAt: null },
      select: { status: true, generationStage: true, publicErrorCode: true, updatedAt: true },
    });
    if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });
    return NextResponse.json({
      status: report.status,
      stage: report.generationStage,
      progress: progressByStage[report.generationStage],
      errorCode: report.publicErrorCode,
      updatedAt: report.updatedAt.toISOString(),
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }
}
