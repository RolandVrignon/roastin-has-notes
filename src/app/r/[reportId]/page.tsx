import type { Metadata } from "next";
import { ReportView } from "@/components/report/report-view";

export const metadata: Metadata = { title: "Your private report", robots: { index: false, follow: false } };

export default async function ReportPage({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  return <ReportView reportId={reportId} />;
}
