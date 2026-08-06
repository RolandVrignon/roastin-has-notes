import type { Metadata } from "next";
import { ReportsDashboard } from "@/components/account/reports-dashboard";

export const metadata: Metadata = { title: "My reports", robots: { index: false, follow: false } };

export default function ReportsPage() {
  return <ReportsDashboard />;
}
