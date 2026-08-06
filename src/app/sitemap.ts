import type { MetadataRoute } from "next";
import { locales, localizedPath } from "@/i18n/config";
import { siteUrl } from "@/i18n/metadata";

const indexedPaths = ["", "/example", "/how-it-works", "/data", "/privacy", "/terms", "/legal", "/cookies", "/help", "/contact", "/delete"];

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((locale) => indexedPaths.map((path) => ({
    url: new URL(localizedPath(locale, path), siteUrl).toString(),
    lastModified: new Date("2026-08-06"),
    changeFrequency: path ? "monthly" as const : "weekly" as const,
    priority: path ? 0.5 : 1,
    alternates: { languages: Object.fromEntries(locales.map((candidate) => [candidate, new URL(localizedPath(candidate, path), siteUrl).toString()])) },
  })));
}
