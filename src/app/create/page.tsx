import type { Metadata } from "next";
import { CreateReportFlow } from "@/components/onboarding/create-report-flow";
import { readUserSession } from "@/lib/user-session";

export const metadata: Metadata = { title: "Create your report" };

export default async function CreatePage() {
  return <CreateReportFlow initiallyAuthenticated={Boolean(await readUserSession())} />;
}
