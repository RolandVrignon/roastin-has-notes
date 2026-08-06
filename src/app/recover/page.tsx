import type { Metadata } from "next";
import { LoginForm } from "@/components/account/login-form";

export const metadata: Metadata = { title: "Recover a report", robots: { index: false, follow: false } };

export default function RecoverPage() {
  return <LoginForm recovery />;
}
