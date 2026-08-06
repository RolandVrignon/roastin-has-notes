import type { Metadata } from "next";
import { ReportSettings } from "@/components/account/report-settings";

export const metadata: Metadata = { title: "Report settings", robots: { index: false, follow: false } };

export default async function ReportSettingsPage({ params }: PageProps<"/reports/[reportId]/settings">) {
  const { reportId } = await params;
  return <ReportSettings reportId={reportId} />;
}
