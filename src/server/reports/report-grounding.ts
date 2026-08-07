import { reportContentSchema } from "@/domain/report";
import type { GenerationAnalysis } from "./generation-schemas";

function quoteForReport(value: string) {
  return `«${value.replace(/^«\s*|\s*»$/g, "").trim()}»`;
}

export function groundReportContent(content: unknown, analysis: GenerationAnalysis) {
  const report = reportContentSchema.parse(content);
  const generatedByName = new Map(report.participants.map((participant) => [participant.name.toLocaleLowerCase("en"), participant]));
  if (generatedByName.size !== analysis.participants.length) throw new Error("REPORT_PARTICIPANT_ROSTER_INVALID");

  return {
    ...report,
    participants: analysis.participants.map((sourceParticipant) => {
      const generated = generatedByName.get(sourceParticipant.name.toLocaleLowerCase("en"));
      if (!generated) throw new Error("REPORT_PARTICIPANT_ROSTER_INVALID");
      return {
        ...generated,
        name: sourceParticipant.name,
        messageCount: sourceParticipant.messageCount,
        share: sourceParticipant.share,
        evidence: sourceParticipant.evidence.map(({ quote }) => quoteForReport(quote)),
      };
    }),
  };
}
