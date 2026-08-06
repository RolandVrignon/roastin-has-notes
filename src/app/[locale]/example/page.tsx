import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FullReport } from "@/components/report/report-view";
import { LocalizedFooter } from "@/components/site/localized-footer";
import { LocalizedHeader } from "@/components/site/localized-header";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/config";
import { pageMetadata } from "@/i18n/metadata";
import { createFallbackReport } from "@/lib/fallback-report";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return pageMetadata(locale, "/example", "Synthetic report example", "A complete, clearly labelled synthetic Roastin report.");
}

export default async function ExamplePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dictionary = await getDictionary(locale);
  const messages = [
    ["Maya", "Are we actually booking Lisbon or just liking videos about it?"], ["Jules", "I am checking now"], ["Theo", "I can do any weekend except every weekend in May"],
    ["Maya", "I made a sheet"], ["Jules", "Of course you did"], ["Theo", "This is why the group survives"], ["Maya", "Please choose a date"], ["Jules", "Friday works"],
    ["Theo", "Which Friday?"], ["Maya", "The one in the sheet"], ["Jules", "I have now opened the sheet"], ["Theo", "Historic moment"],
  ].map(([author, body], index) => ({ author, body, date: new Date(Date.UTC(2026, 4, index + 1, 18, 0)) }));
  const participants = ["Maya", "Jules", "Theo"].map((name) => {
    const messageCount = messages.filter((message) => message.author === name).length;
    return { name, messageCount, share: Math.round(messageCount / messages.length * 100) };
  });
  const report = createFallbackReport({ messages, participants, firstDate: messages[0].date, lastDate: messages.at(-1)?.date ?? null }, "The Lisbon Planning Committee", locale);
  return <main id="content"><LocalizedHeader dictionary={dictionary} locale={locale} pathname="/example" /><section className="border-b border-[#112b4d]/15 bg-[#f6a913] px-5 py-4 text-center text-sm font-black">Synthetic example · no real conversation or testimonial</section><FullReport report={report} /><LocalizedFooter dictionary={dictionary} locale={locale} /></main>;
}
