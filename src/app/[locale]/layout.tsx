import { notFound } from "next/navigation";
import { isLocale, locales } from "@/i18n/config";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <div lang={locale}>{children}</div>;
}
