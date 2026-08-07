import { reportContentSchema, type RoastReport } from "@/domain/report";
import type { Locale } from "@/i18n/config";
import { reportLocaleProfiles, type ReportLanguage } from "./report-locales";

const languageWords = {
  en: ["the", "and", "you", "your", "is", "are", "to", "of", "in", "that", "this", "with", "for", "but", "not", "from", "have", "has"],
  fr: ["le", "la", "les", "un", "une", "des", "de", "du", "et", "est", "sont", "tu", "ton", "ta", "tes", "vous", "votre", "pour", "avec", "dans", "que", "qui", "pas", "mais"],
  es: ["el", "la", "los", "las", "un", "una", "del", "y", "es", "son", "tú", "tu", "tus", "ustedes", "para", "con", "en", "que", "no", "pero", "por", "este", "esta"],
  it: ["il", "lo", "la", "gli", "le", "un", "una", "di", "del", "e", "è", "sono", "tu", "tuo", "tua", "voi", "vostro", "per", "con", "in", "che", "non", "ma", "questo", "questa"],
  de: ["der", "die", "das", "ein", "eine", "und", "ist", "sind", "du", "dein", "deine", "ihr", "eure", "für", "mit", "in", "dass", "nicht", "aber", "von", "zu", "im"],
  pt: ["o", "a", "os", "as", "um", "uma", "de", "do", "da", "e", "é", "são", "tu", "teu", "sua", "você", "vocês", "para", "com", "em", "que", "não", "mas", "por", "este", "esta"],
  nl: ["de", "het", "een", "en", "is", "zijn", "jij", "je", "jouw", "jullie", "voor", "met", "in", "dat", "die", "niet", "maar", "van", "op", "te"],
} satisfies Record<ReportLanguage, string[]>;

function narrativeText(input: unknown) {
  const report = reportContentSchema.parse(input);
  return [
    report.title, report.subtitle, report.opening,
    ...report.participants.flatMap(({ title, portrait, finalLine }) => [title, portrait, finalLine]),
    ...report.awards.flatMap(({ title, reason }) => [title, reason]),
    ...report.dictionary.map(({ meaning }) => meaning),
    ...report.dynamics,
    ...report.flags.green, ...report.flags.yellow, ...report.flags.red,
    ...report.reactions.map(({ reaction }) => reaction),
    report.finalVerdict,
  ].join(" ");
}

export function evaluateReportLanguage(input: unknown, locale: Locale) {
  const tokens = narrativeText(input).toLocaleLowerCase(locale).match(/\p{L}+/gu) ?? [];
  const counts = new Map<string, number>();
  for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1);
  const scores = Object.fromEntries(Object.entries(languageWords).map(([language, words]) => [language, words.reduce((total, word) => total + (counts.get(word) ?? 0), 0)])) as Record<ReportLanguage, number>;
  const expected = reportLocaleProfiles[locale].language;
  const expectedScore = scores[expected];
  const highestScore = Math.max(...Object.values(scores));
  return { matches: expectedScore >= 8 && expectedScore >= highestScore * 0.9, expected, expectedScore, highestScore, scores };
}

export function reportLanguageMatches(input: unknown, locale: Locale) {
  return evaluateReportLanguage(input, locale).matches;
}

export function storedReportLanguageMatches(report: RoastReport, locale: Locale) {
  return reportLanguageMatches(reportContentSchema.parse(report), locale);
}
