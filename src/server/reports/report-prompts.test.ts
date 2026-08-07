import { describe, expect, it } from "vitest";
import { reportPromptVersion } from "./report-locales";
import { writingSystemPrompt } from "./report-prompts";

describe("report prompt contract", () => {
  it("versions the interleaved evidence layout instruction", () => {
    expect(reportPromptVersion("fr")).toBe("classic-v5+fr-v1");
    expect(writingSystemPrompt("fr")).toContain("Embed every selected evidence quote exactly once and verbatim inside the participant portrait");
  });
});
