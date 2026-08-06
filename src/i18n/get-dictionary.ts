import "server-only";
import type { Locale } from "@/i18n/config";

const dictionaries = {
  en: () => import("@/i18n/dictionaries/en").then((module) => module.default),
  fr: () => import("@/i18n/dictionaries/fr").then((module) => module.default),
  es: () => import("@/i18n/dictionaries/es").then((module) => module.default),
  it: () => import("@/i18n/dictionaries/it").then((module) => module.default),
  de: () => import("@/i18n/dictionaries/de").then((module) => module.default),
  "pt-br": () => import("@/i18n/dictionaries/pt-br").then((module) => module.default),
  pt: () => import("@/i18n/dictionaries/pt").then((module) => module.default),
  nl: () => import("@/i18n/dictionaries/nl").then((module) => module.default),
};

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]();
}
