import { describe, expect, it } from "vitest";
import { reportSchema } from "@/domain/report";
import { locales } from "@/i18n/config";
import { createFallbackReport } from "@/lib/fallback-report";
import { storedReportLanguageMatches } from "@/server/reports/report-language";

const conversation = {
  messages: Array.from({ length: 12 }, (_, index) => ({ author: index % 2 ? "Maya" : "Jules", body: `A sufficiently descriptive sample message number ${index}`, date: new Date(Date.UTC(2026, 4, index + 1)) })),
  participants: [{ name: "Maya", messageCount: 6, share: 50 }, { name: "Jules", messageCount: 6, share: 50 }],
  firstDate: new Date(Date.UTC(2026, 4, 1)),
  lastDate: new Date(Date.UTC(2026, 4, 12)),
};

describe("localized deterministic report fallback", () => {
  it.each(locales)("produces a valid report for %s", (locale) => {
    const report = createFallbackReport(conversation, "Weekend Crew", locale);
    expect(() => reportSchema.parse(report)).not.toThrow();
    expect(report.locale).toBe(locale);
    expect(report.participants).toHaveLength(2);
    expect(storedReportLanguageMatches(report, locale)).toBe(true);
  });

  it("does not reuse the English editorial fallback for French", () => {
    const report = createFallbackReport(conversation, "Weekend Crew", "fr");
    expect(report.subtitle).toContain("lecture minutieuse");
    expect(report.title).not.toContain("Beautifully Managed Disaster");
  });
});
