import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocalizedLanding } from "@/components/site/localized-landing";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/config";
import { landingMetadata } from "@/i18n/metadata";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return landingMetadata(locale, await getDictionary(locale));
}

export default async function LocalizedHome({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <LocalizedLanding dictionary={await getDictionary(locale)} locale={locale} />;
}
