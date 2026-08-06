import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocalizedCreateReportFlow } from "@/components/onboarding/localized-create-report-flow";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/config";
import { pageMetadata } from "@/i18n/metadata";

export async function generateMetadata({ params }: PageProps<"/[locale]/create">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dictionary = await getDictionary(locale);
  return { ...pageMetadata(locale, "/create", dictionary.common.createReport, dictionary.seo.description), robots: { index: false, follow: false } };
}

export default async function LocalizedCreatePage({ params }: PageProps<"/[locale]/create">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <LocalizedCreateReportFlow dictionary={await getDictionary(locale)} locale={locale} />;
}
