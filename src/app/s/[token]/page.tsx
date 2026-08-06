import type { Metadata } from "next";
import { SharedReportView } from "@/components/report/shared-report-view";

export const metadata: Metadata = { title: "A shared Roastin report", robots: { index: false, follow: false } };

export default async function SharedReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <SharedReportView token={token} />;
}
