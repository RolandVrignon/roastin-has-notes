import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CreateReportFlow } from "@/components/onboarding/create-report-flow";
import { readUserSession } from "@/lib/user-session";

export const metadata: Metadata = { title: "Create your report" };

export default async function CreatePage() {
  if (!await readUserSession()) redirect("/login?next=/create");
  return <CreateReportFlow />;
}
