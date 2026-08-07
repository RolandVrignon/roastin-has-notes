import { z } from "zod";
import type { RoastReport } from "@/domain/report";
import { isLocale, type Locale } from "@/i18n/config";

export const quizQuestionSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  choices: z.array(z.string()).min(2).max(4),
  correctIndex: z.number().int().nonnegative(),
  explanation: z.string(),
});

export const reportQuizSchema = z.object({
  reportId: z.string(),
  title: z.string(),
  questions: z.array(quizQuestionSchema).min(1).max(8),
});

export type ReportQuiz = z.infer<typeof reportQuizSchema>;

type QuizCopy = {
  title: string;
  quote: (quote: string) => string;
  quoteAnswer: (name: string) => string;
  award: (award: string) => string;
  awardAnswer: (name: string, reason: string) => string;
  dictionary: (term: string) => string;
  dictionaryAnswer: (meaning: string) => string;
};

const en: QuizCopy = {
  title: "Who really read the chat?",
  quote: (quote) => `Who sent “${quote}”?`,
  quoteAnswer: (name) => `That one belongs to ${name}.`,
  award: (award) => `Who won “${award}”?`,
  awardAnswer: (name, reason) => `${name}. ${reason}`,
  dictionary: (term) => `In this group, what does “${term}” really mean?`,
  dictionaryAnswer: (meaning) => meaning,
};

const copies: Record<Locale, QuizCopy> = {
  en,
  fr: { title: "Qui a vraiment lu la conversation ?", quote: (quote) => `Qui a envoyé « ${quote} » ?`, quoteAnswer: (name) => `Ce message est signé ${name}.`, award: (award) => `Qui a remporté « ${award} » ?`, awardAnswer: (name, reason) => `${name}. ${reason}`, dictionary: (term) => `Dans ce groupe, que veut vraiment dire « ${term} » ?`, dictionaryAnswer: (meaning) => meaning },
  es: { title: "¿Quién leyó de verdad el chat?", quote: (quote) => `¿Quién envió «${quote}»?`, quoteAnswer: (name) => `Ese mensaje es de ${name}.`, award: (award) => `¿Quién ganó «${award}»?`, awardAnswer: (name, reason) => `${name}. ${reason}`, dictionary: (term) => `En este grupo, ¿qué significa realmente «${term}»?`, dictionaryAnswer: (meaning) => meaning },
  it: { title: "Chi ha letto davvero la chat?", quote: (quote) => `Chi ha scritto «${quote}»?`, quoteAnswer: (name) => `Quel messaggio è di ${name}.`, award: (award) => `Chi ha vinto «${award}»?`, awardAnswer: (name, reason) => `${name}. ${reason}`, dictionary: (term) => `In questo gruppo, cosa significa davvero «${term}»?`, dictionaryAnswer: (meaning) => meaning },
  de: { title: "Wer hat den Chat wirklich gelesen?", quote: (quote) => `Wer schrieb „${quote}“?`, quoteAnswer: (name) => `Diese Nachricht ist von ${name}.`, award: (award) => `Wer gewann „${award}“?`, awardAnswer: (name, reason) => `${name}. ${reason}`, dictionary: (term) => `Was bedeutet „${term}“ in dieser Gruppe wirklich?`, dictionaryAnswer: (meaning) => meaning },
  "pt-br": { title: "Quem realmente leu a conversa?", quote: (quote) => `Quem enviou “${quote}”?`, quoteAnswer: (name) => `Essa mensagem é de ${name}.`, award: (award) => `Quem ganhou “${award}”?`, awardAnswer: (name, reason) => `${name}. ${reason}`, dictionary: (term) => `Neste grupo, o que “${term}” realmente significa?`, dictionaryAnswer: (meaning) => meaning },
  pt: { title: "Quem leu mesmo a conversa?", quote: (quote) => `Quem enviou «${quote}»?`, quoteAnswer: (name) => `Essa mensagem é de ${name}.`, award: (award) => `Quem ganhou «${award}»?`, awardAnswer: (name, reason) => `${name}. ${reason}`, dictionary: (term) => `Neste grupo, o que significa realmente «${term}»?`, dictionaryAnswer: (meaning) => meaning },
  nl: { title: "Wie heeft de chat echt gelezen?", quote: (quote) => `Wie stuurde “${quote}”?`, quoteAnswer: (name) => `Dat bericht is van ${name}.`, award: (award) => `Wie won “${award}”?`, awardAnswer: (name, reason) => `${name}. ${reason}`, dictionary: (term) => `Wat betekent “${term}” echt in deze groep?`, dictionaryAnswer: (meaning) => meaning },
};

function seedFor(value: string) {
  let seed = 2166136261;
  for (const character of value) seed = Math.imul(seed ^ character.charCodeAt(0), 16777619);
  return seed >>> 0;
}

function random(seed: number) {
  let state = seed || 1;
  return () => {
    state = Math.imul(state ^ (state >>> 15), 1 | state);
    state ^= state + Math.imul(state ^ (state >>> 7), 61 | state);
    return ((state ^ (state >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(values: T[], next: () => number) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(next() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function cleanQuote(value: string) {
  return value.replace(/^\s*[«“"]|[»”"]\s*$/g, "").trim();
}

function withShuffledAnswer(id: string, prompt: string, choices: string[], answer: string, explanation: string, next: () => number) {
  const candidates = [answer, ...choices.filter((choice) => choice !== answer)];
  const shuffledChoices = shuffled([...new Set(candidates)].slice(0, 4), next);
  return { id, prompt, choices: shuffledChoices, correctIndex: shuffledChoices.indexOf(answer), explanation };
}

export function buildReportQuiz(report: RoastReport): ReportQuiz {
  const locale = isLocale(report.locale) ? report.locale : "en";
  const copy = copies[locale];
  const next = random(seedFor(report.id));
  const names = report.participants.map(({ name }) => name);
  const questions = [];

  for (const participant of report.participants) {
    const quote = participant.evidence.map(cleanQuote).find(Boolean);
    if (!quote || names.length < 2) continue;
    questions.push(withShuffledAnswer(`quote-${questions.length}`, copy.quote(quote), names, participant.name, copy.quoteAnswer(participant.name), next));
  }
  for (const [index, award] of report.awards.entries()) {
    if (!names.includes(award.winner) || names.length < 2) continue;
    questions.push(withShuffledAnswer(`award-${index}`, copy.award(award.title), names, award.winner, copy.awardAnswer(award.winner, award.reason), next));
  }
  const meanings = report.dictionary.map(({ meaning }) => meaning);
  for (const [index, entry] of report.dictionary.entries()) {
    if (meanings.length < 2) continue;
    questions.push(withShuffledAnswer(`dictionary-${index}`, copy.dictionary(entry.term), meanings, entry.meaning, copy.dictionaryAnswer(entry.meaning), next));
  }

  return reportQuizSchema.parse({ reportId: report.id, title: copy.title, questions: shuffled(questions, next).slice(0, 8) });
}
