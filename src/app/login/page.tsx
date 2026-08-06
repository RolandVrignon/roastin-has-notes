import type { Metadata } from "next";
import { LoginForm } from "@/components/account/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const requested = (await searchParams).next;
  const nextPath = requested?.startsWith("/") && !requested.startsWith("//") ? requested : "/reports";
  return <LoginForm nextPath={nextPath} />;
}
