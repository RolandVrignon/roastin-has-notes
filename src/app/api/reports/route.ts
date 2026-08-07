import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { hasEntitlement } from "@/lib/entitlements";
import { viewerReportWhere } from "@/lib/report-access";

export async function GET() {
  const access = await viewerReportWhere();
  if (!access) return NextResponse.json({ reports: [] });
  const reports = await getPrisma().report.findMany({
    where: { ...access, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, chatName: true, status: true, createdAt: true, messageCount: true, participantCount: true, entitlements: { select: { offerCode: true } }, deliveries: { take: 1, orderBy: { createdAt: "desc" }, select: { status: true } } },
  });
  return NextResponse.json({ reports: reports.map(({ entitlements, deliveries, ...report }) => ({ ...report, unlocked: hasEntitlement(entitlements, "classic"), quizUnlocked: hasEntitlement(entitlements, "quiz"), deliveryStatus: deliveries[0]?.status ?? null })) }, { headers: { "Cache-Control": "private, no-store" } });
}
