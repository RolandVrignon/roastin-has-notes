import { describe, expect, it } from "vitest";
import { generationAnalysisSchema } from "./generation-schemas";
import { groundReportContent } from "./report-grounding";

const analysis = generationAnalysisSchema.parse({
  participants: [
    { name: "Maya", messageCount: 12, share: 60, behaviours: ["Turns every poll into a campaign"], evidence: [{ messageIndex: 2, quote: "We need a poll for the poll", observation: "The planning loop becomes its own event" }] },
    { name: "Jules", messageCount: 8, share: 40, behaviours: ["Arrives after the decision"], evidence: [{ messageIndex: 7, quote: "Wait, what did we decide?", observation: "The answer is already above" }] },
  ],
  recurringPatterns: ["Polls create more polls", "Decisions expire quickly"],
  groupDynamics: ["Maya launches plans", "Jules reopens them"],
  vocabulary: [],
  safety: { approved: true, notes: [] },
});

const content = {
  title: "A title", subtitle: "A subtitle", opening: "An opening",
  participants: [
    { name: "Jules", messageCount: 999, share: 99, title: "Late", portrait: "Portrait", evidence: ["invented"], finalLine: "Line" },
    { name: "Maya", messageCount: 1, share: 1, title: "Pollster", portrait: "Portrait", evidence: ["paraphrase"], finalLine: "Line" },
  ],
  awards: [], dictionary: [], dynamics: [], flags: { green: [], yellow: [], red: [] }, reactions: [], finalVerdict: "Verdict",
};

describe("groundReportContent", () => {
  it("locks the source roster, statistics, order, and exact quotes", () => {
    const grounded = groundReportContent(content, analysis);
    expect(grounded.participants.map(({ name, messageCount, share }) => ({ name, messageCount, share }))).toEqual([
      { name: "Maya", messageCount: 12, share: 60 },
      { name: "Jules", messageCount: 8, share: 40 },
    ]);
    expect(grounded.participants[0]?.evidence).toEqual(["«We need a poll for the poll»"]);
  });

  it("rejects a participant invented by the writing pass", () => {
    const invalid = { ...content, participants: content.participants.map((participant, index) => index ? { ...participant, name: "Invented" } : participant) };
    expect(() => groundReportContent(invalid, analysis)).toThrow("REPORT_PARTICIPANT_ROSTER_INVALID");
  });
});
