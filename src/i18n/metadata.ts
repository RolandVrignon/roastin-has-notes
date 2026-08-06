import type { Metadata } from "next";
import { locales, localizedPath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

export const siteUrl = new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");

export function localizedAlternates(locale: Locale, path = "") {
  const languages = Object.fromEntries(locales.map((candidate) => [candidate, localizedPath(candidate, path)]));
  return {
    canonical: localizedPath(locale, path),
    languages: { ...languages, "x-default": localizedPath("en", path) },
  };
}

export function pageMetadata(
  locale: Locale,
  path: string,
  title: string,
  description: string,
): Metadata {
  const url = localizedPath(locale, path);
  return {
    title,
    description,
    alternates: localizedAlternates(locale, path),
    openGraph: {
      type: "website",
      locale: locale.replace("-", "_"),
      url,
      siteName: "Roastin Has Notes",
      title,
      description,
      images: [{ url: "/brand/roastin-brand-board.png", width: 1536, height: 1024, alt: "Roastin Has Notes" }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/brand/roastin-brand-board.png"] },
  };
}

export function landingMetadata(locale: Locale, dictionary: Dictionary): Metadata {
  return pageMetadata(locale, "", dictionary.seo.title, dictionary.seo.description);
}
