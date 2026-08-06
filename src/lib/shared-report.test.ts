import { describe, expect, it } from "vitest";
import { reportSchema } from "@/domain/report";
import { prepareSharedReport } from "@/lib/shared-report";

const report = reportSchema.parse({
  id: "report-1",
  title: "Alex and Sam have notes",
  subtitle: "Alex starts it; Sam answers.",
  chatName: "Alex + Sam",
  locale: "en",
  createdAt: new Date(0).toISOString(),
  stats: { messageCount: 42, participantCount: 2, dateRange: "January" },
  opening: "Alex brought the plan and Sam brought the delay.",
  participants: [
    { name: "Alex", messageCount: 22, share: 52, title: "Planner", portrait: "Alex plans.", evidence: ["Alex: Dinner?"], finalLine: "Alex has a calendar." },
    { name: "Sam", messageCount: 20, share: 48, title: "Responder", portrait: "Sam waits.", evidence: ["Sam: Sure"], finalLine: "Sam will reply tomorrow." },
  ],
  awards: [{ title: "Planner", winner: "Alex", reason: "Alex tried." }],
  dictionary: [{ term: "sure", meaning: "Sam means maybe." }],
  dynamics: ["Alex asks and Sam answers."],
  flags: { green: ["Alex follows up."], yellow: ["Sam delays."], red: [] },
  reactions: [{ name: "Alex", reaction: "Alex will laugh." }],
  finalVerdict: "Alex and Sam still show up.",
});

describe("shared report privacy", () => {
  it("replaces participant names throughout the shared payload", () => {
    const shared = prepareSharedReport(report, { anonymizeNames: true, hideQuotes: false });
    expect(JSON.stringify(shared)).not.toMatch(/Alex|Sam/);
    expect(shared.participants.map(({ name }) => name)).toEqual(["Participant 1", "Participant 2"]);
    expect(shared.chatName).toBe("Private chat");
  });

  it("removes evidence quotes without changing the owner report", () => {
    const shared = prepareSharedReport(report, { anonymizeNames: false, hideQuotes: true });
    expect(shared.participants.every(({ evidence }) => evidence.length === 0)).toBe(true);
    expect(report.participants[0].evidence).toHaveLength(1);
  });
});
