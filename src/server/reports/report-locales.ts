import type { Locale } from "@/i18n/config";

export type ReportLanguage = "de" | "en" | "es" | "fr" | "it" | "nl" | "pt";

type LocaleProfile = {
  version: string;
  language: ReportLanguage;
  label: string;
  instruction: string;
};

export const reportLocaleProfiles = {
  en: { version: "en-v1", language: "en", label: "English", instruction: "Write only in natural contemporary English. Address each participant directly as ‘you’. Preserve names, brands, slang, and exact source quotes without translating them. Avoid translated-sounding syntax." },
  fr: { version: "fr-v1", language: "fr", label: "French (France)", instruction: "Write only in natural contemporary French from France. Use ‘tu’ for an individual participant and ‘vous’ for the group. Preserve names, brands, slang, and exact source quotes without translating them. Use idiomatic French comedy rather than English calques." },
  es: { version: "es-v1", language: "es", label: "Spanish", instruction: "Write only in natural contemporary Spanish. Use informal ‘tú’ for an individual participant and a consistent natural plural form for the group. Preserve names, brands, slang, and exact source quotes without translating them. Avoid French or English calques." },
  it: { version: "it-v1", language: "it", label: "Italian", instruction: "Write only in natural contemporary Italian. Use informal ‘tu’ for an individual participant and ‘voi’ for the group. Preserve names, brands, slang, and exact source quotes without translating them. Prefer idiomatic Italian comic timing." },
  de: { version: "de-v1", language: "de", label: "German", instruction: "Write only in natural contemporary German. Use informal ‘du’ for an individual participant and ‘ihr’ for the group. Preserve names, brands, slang, and exact source quotes without translating them. Avoid literal English sentence structure." },
  "pt-br": { version: "pt-br-v1", language: "pt", label: "Brazilian Portuguese", instruction: "Write only in natural contemporary Brazilian Portuguese. Use ‘você’ for an individual participant and ‘vocês’ for the group. Preserve names, brands, slang, and exact source quotes without translating them. Do not drift into European Portuguese." },
  pt: { version: "pt-v1", language: "pt", label: "European Portuguese", instruction: "Write only in natural contemporary European Portuguese. Use ‘tu’ for an individual participant and a natural European Portuguese plural for the group. Preserve names, brands, slang, and exact source quotes without translating them. Do not use Brazilian constructions or vocabulary." },
  nl: { version: "nl-v1", language: "nl", label: "Dutch", instruction: "Write only in natural contemporary Dutch. Use informal ‘jij/je’ for an individual participant and ‘jullie’ for the group. Preserve names, brands, slang, and exact source quotes without translating them. Avoid literal English syntax." },
} satisfies Record<Locale, LocaleProfile>;

export const ROAST_PROMPT_VERSION = "classic-v7";

export function reportPromptVersion(locale: Locale) {
  return `${ROAST_PROMPT_VERSION}+${reportLocaleProfiles[locale].version}`;
}

export function reportLocaleInstruction(locale: Locale) {
  const profile = reportLocaleProfiles[locale];
  return `[Language profile ${profile.version}: ${profile.label}] ${profile.instruction}`;
}
