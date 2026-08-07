import { describe, expect, it } from "vitest";
import { reportPromptVersion } from "./report-locales";
import { writingSystemPrompt } from "./report-prompts";

describe("report prompt contract", () => {
  it("versions the interleaved evidence layout instruction", () => {
    expect(reportPromptVersion("fr")).toBe("classic-v7+fr-v1");
    expect(writingSystemPrompt("fr")).toContain("Embed every selected evidence quote exactly once and verbatim inside the participant portrait");
    expect(writingSystemPrompt("fr")).toContain("personality card grounded only in their observed chat behaviour");
    expect(writingSystemPrompt("fr")).toContain("8/10 roast intensity");
    expect(writingSystemPrompt("fr")).toContain("genuinely savage punchline");
    expect(writingSystemPrompt("fr")).toContain("Never use slurs");
  });
});
