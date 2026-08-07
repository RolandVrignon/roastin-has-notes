import { describe, expect, it } from "vitest";
import { parseReportEvidence } from "./report-evidence";

describe("parseReportEvidence", () => {
  it("separates an exact WhatsApp quote from legacy commentary", () => {
    expect(parseReportEvidence("« On se fait quand une pétanque ?? » : la relance officielle")).toEqual({ message: "On se fait quand une pétanque ??", note: "la relance officielle", isQuote: true });
  });

  it("keeps ungrounded legacy observations out of quote bubbles", () => {
    expect(parseReportEvidence("Son sondage devient une élection municipale.").isQuote).toBe(false);
  });
});
