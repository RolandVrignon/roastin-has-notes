import { describe, expect, it } from "vitest";
import { analysisEvidenceIsAnchored, anchorAnalysisEvidence } from "./analysis-evidence";
import { generationAnalysisSchema } from "./generation-schemas";

function analysis() {
  return generationAnalysisSchema.parse({
    participants: [
      { name: "Maya", messageCount: 2, share: 50, behaviours: ["Plans"], evidence: [{ messageIndex: 0, quote: "paraphrased", observation: "Starts the plan" }] },
      { name: "Jules", messageCount: 2, share: 50, behaviours: ["Replies"], evidence: [{ messageIndex: 0, quote: "wrong author", observation: "Replies later" }] },
    ],
    recurringPatterns: ["Planning", "Follow-ups"],
    groupDynamics: ["One plans", "One replies"],
    vocabulary: [],
    safety: { approved: true, notes: [] },
  });
}

describe("analysis evidence anchoring", () => {
  it("replaces model wording with exact source excerpts and repairs invalid references", () => {
    const messages = [
      { author: "Maya", body: "Dinner on Friday? I can book the table." },
      { author: "Jules", body: "Yes, 8pm works for me." },
    ];

    const anchored = anchorAnalysisEvidence(analysis(), messages);

    expect(anchored.participants[0].evidence).toEqual([{
      messageIndex: 0,
      quote: messages[0].body,
      observation: "Starts the plan",
    }]);
    expect(anchored.participants[1].evidence).toEqual([{
      messageIndex: 1,
      quote: messages[1].body,
      observation: "A representative example of their contribution style",
    }]);
    expect(analysisEvidenceIsAnchored(anchored, messages)).toBe(true);
  });
});
