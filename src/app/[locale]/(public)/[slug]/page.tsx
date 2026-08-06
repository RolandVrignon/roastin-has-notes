import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentPage } from "@/components/site/content-page";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, locales } from "@/i18n/config";
import { pageMetadata } from "@/i18n/metadata";
import type { Dictionary } from "@/i18n/types";

const publicSlugs = ["privacy", "terms", "help", "contact", "delete", "how-it-works", "data", "legal", "cookies"] as const;
type PublicSlug = (typeof publicSlugs)[number];

function isPublicSlug(value: string): value is PublicSlug {
  return publicSlugs.includes(value as PublicSlug);
}

function contentFor(dictionary: Dictionary, slug: PublicSlug) {
  if (slug === "how-it-works") return {
    eyebrow: dictionary.landing.howEyebrow,
    title: dictionary.landing.howTitle,
    intro: dictionary.landing.howText,
    sections: dictionary.landing.steps.map((step) => ({ title: step.title, paragraphs: [step.text] })),
  };
  if (slug === "data") return dictionary.pages.privacy;
  if (slug === "legal") return dictionary.pages.terms;
  if (slug === "cookies") return {
    eyebrow: dictionary.pages.privacy.eyebrow,
    title: "Cookies",
    intro: dictionary.pages.privacy.intro,
    sections: [{
      title: dictionary.pages.privacy.title,
      paragraphs: ["Roastin uses only essential, secure cookies for anonymous report ownership and passwordless sessions. Advertising and cross-site tracking cookies are not part of the MVP."],
    }],
  };
  return dictionary.pages[slug];
}

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => publicSlugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale) || !isPublicSlug(slug)) notFound();
  const page = contentFor(await getDictionary(locale), slug);
  return pageMetadata(locale, `/${slug}`, page.title, page.intro);
}

export default async function PublicPage({ params }: PageProps<"/[locale]/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale) || !isPublicSlug(slug)) notFound();
  const dictionary = await getDictionary(locale);
  return <ContentPage dictionary={dictionary} locale={locale} page={contentFor(dictionary, slug)} pathname={`/${slug}`} />;
}
