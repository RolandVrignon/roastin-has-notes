import { describe, expect, it } from "vitest";
import { reportSchema } from "@/domain/report";
import { buildReportQuiz } from "@/lib/report-quiz";

const report = reportSchema.parse({
  id: "report-quiz",
  title: "The group",
  subtitle: "Notes",
  chatName: "Friends",
  locale: "fr",
  createdAt: new Date(0).toISOString(),
  stats: { messageCount: 20, participantCount: 3, dateRange: "2026" },
  opening: "Opening",
  participants: [
    { name: "Alex", messageCount: 8, share: 40, title: "A", portrait: "A", evidence: ["« On fait un sondage pour le sondage »"], finalLine: "A" },
    { name: "Sam", messageCount: 7, share: 35, title: "B", portrait: "B", evidence: ["« J'arrive dans cinq minutes »"], finalLine: "B" },
    { name: "Lou", messageCount: 5, share: 25, title: "C", portrait: "C", evidence: ["« Qui a les clés ? »"], finalLine: "C" },
  ],
  awards: [{ title: "Prix du sondage", winner: "Alex", reason: "Deux sondages avant de choisir." }],
  dictionary: [{ term: "J'arrive", meaning: "Départ encore non confirmé." }, { term: "Oui", meaning: "Accusé de réception sans engagement." }],
  dynamics: [], flags: { green: [], yellow: [], red: [] }, reactions: [], finalVerdict: "Verdict",
});

describe("report quiz", () => {
  it("builds a deterministic quiz with exactly one correct choice", () => {
    const first = buildReportQuiz(report);
    const second = buildReportQuiz(report);
    expect(first).toEqual(second);
    expect(first.questions.length).toBeGreaterThanOrEqual(6);
    for (const question of first.questions) {
      expect(question.correctIndex).toBeGreaterThanOrEqual(0);
      expect(question.correctIndex).toBeLessThan(question.choices.length);
      expect(new Set(question.choices).size).toBe(question.choices.length);
    }
  });

  it("uses only facts already present in the stored report", () => {
    const serialized = JSON.stringify(buildReportQuiz(report));
    expect(serialized).toContain("sondage pour le sondage");
    expect(serialized).not.toContain("phone");
  });

  it("keeps the right participant when the cast exceeds four choices", () => {
    const largeCast = reportSchema.parse({
      ...report,
      participants: Array.from({ length: 9 }, (_, index) => ({ name: `Person ${index + 1}`, messageCount: 10, share: 11, title: "Title", portrait: "Portrait", evidence: [`« Quote ${index + 1} »`], finalLine: "Line" })),
      stats: { ...report.stats, participantCount: 9 },
      awards: [],
    });
    const quiz = buildReportQuiz(largeCast);
    for (const question of quiz.questions) expect(question.correctIndex).toBeGreaterThanOrEqual(0);
  });
});
