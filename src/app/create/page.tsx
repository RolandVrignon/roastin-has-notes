import type { Metadata } from "next";
import { CreateReportFlow } from "@/components/onboarding/create-report-flow";

export const metadata: Metadata = { title: "Create your report" };

export default function CreatePage() {
  return <CreateReportFlow />;
}
