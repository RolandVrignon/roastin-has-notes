import { describe, expect, it } from "vitest";
import type { Locale } from "@/i18n/config";
import { evaluateReportLanguage } from "./report-language";
import { reportLocaleInstruction, reportLocaleProfiles, reportPromptVersion } from "./report-locales";

const samples: Record<Locale, string> = {
  en: "You are the person who turns every plan into a meeting, and your friends know that the calendar is not safe with you in the group.",
  fr: "Tu es la personne qui transforme chaque sortie en réunion, et tes amis savent que le calendrier n’est jamais tranquille avec toi dans le groupe.",
  es: "Tú eres la persona que convierte cada plan en una reunión, y tus amigos saben que el calendario nunca está tranquilo contigo en el grupo.",
  it: "Tu sei la persona che trasforma ogni piano in una riunione, e i tuoi amici sanno che il calendario non è mai tranquillo con te nel gruppo.",
  de: "Du bist die Person, die jeden Plan in eine Sitzung verwandelt, und deine Freunde wissen, dass der Kalender mit dir in der Gruppe nicht sicher ist.",
  "pt-br": "Você é a pessoa que transforma cada plano em uma reunião, e os seus amigos sabem que o calendário não fica tranquilo com você no grupo.",
  pt: "Tu és a pessoa que transforma cada plano numa reunião, e os teus amigos sabem que o calendário não fica tranquilo contigo no grupo.",
  nl: "Jij bent de persoon die elk plan in een vergadering verandert, en jouw vrienden weten dat de agenda met jou in de groep niet veilig is.",
};

function reportWithNarrative(text: string) {
  const repeated = `${text} ${text} ${text}`;
  return { title: text, subtitle: text, opening: repeated, participants: [{ name: "Alex", messageCount: 10, share: 100, title: text, portrait: repeated, evidence: ["«source quote»"], finalLine: text }], awards: [], dictionary: [], dynamics: [text], flags: { green: [], yellow: [], red: [] }, reactions: [], finalVerdict: repeated };
}

describe("report locale profiles", () => {
  it("versions every supported locale independently", () => {
    for (const locale of Object.keys(samples) as Locale[]) {
      expect(reportPromptVersion(locale)).toContain(reportLocaleProfiles[locale].version);
      expect(reportLocaleInstruction(locale)).toContain(reportLocaleProfiles[locale].label);
    }
  });

  it.each(Object.entries(samples) as Array<[Locale, string]>)("recognises %s narrative output", (locale, sample) => {
    expect(evaluateReportLanguage(reportWithNarrative(sample), locale).matches).toBe(true);
  });

  it("rejects a French report requested in Spanish", () => {
    expect(evaluateReportLanguage(reportWithNarrative(samples.fr), "es").matches).toBe(false);
  });
});
