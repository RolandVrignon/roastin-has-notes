import { NextResponse } from "next/server";
import { z } from "zod";
import { reportSchema } from "@/domain/report";
import { getPrisma } from "@/lib/db";
import { classicOfferCodes, quizOfferCodes } from "@/lib/entitlements";
import { buildReportQuiz } from "@/lib/report-quiz";
import { viewerReportWhere } from "@/lib/report-access";

const paramsSchema = z.object({ reportId: z.string().uuid() });

export async function GET(_: Request, context: { params: Promise<{ reportId: string }> }) {
  try {
    const { reportId } = paramsSchema.parse(await context.params);
    const access = await viewerReportWhere();
    if (!access) return NextResponse.json({ error: "Report not found" }, { status: 404 });
    const report = await getPrisma().report.findFirst({
      where: { id: reportId, ...access, deletedAt: null, status: "READY" },
      select: { content: true, entitlements: { select: { offerCode: true } } },
    });
    if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });
    const codes = new Set(report.entitlements.map(({ offerCode }) => offerCode));
    if (![...classicOfferCodes].some((code) => codes.has(code))) return NextResponse.json({ error: "Classic report required" }, { status: 409 });
    if (![...quizOfferCodes].some((code) => codes.has(code))) return NextResponse.json({ error: "Quiz not unlocked" }, { status: 402 });
    return NextResponse.json({ quiz: buildReportQuiz(reportSchema.parse(report.content)) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Quiz is unavailable" }, { status: 500 });
  }
}
