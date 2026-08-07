import type { GenerationAnalysis } from "./generation-schemas";

type SourceMessage = { author: string; body: string };
type SourceParticipant = { name: string; messageCount: number; share: number };

export function evidenceExcerpt(value: string, maximumLength = 280) {
  if (value.length <= maximumLength) return value;
  const candidate = value.slice(0, maximumLength - 1);
  const lastBoundary = Math.max(candidate.lastIndexOf(" "), candidate.lastIndexOf("\n"));
  const excerpt = lastBoundary >= Math.floor(maximumLength * 0.7) ? candidate.slice(0, lastBoundary) : candidate;
  return `${excerpt.trimEnd()}…`;
}

export function anchorAnalysisEvidence(analysis: GenerationAnalysis, messages: SourceMessage[], sourceParticipants: SourceParticipant[]): GenerationAnalysis {
  return {
    ...analysis,
    participants: sourceParticipants.map((sourceParticipant) => {
      const participant = analysis.participants.find(({ name }) => name.toLocaleLowerCase("en") === sourceParticipant.name.toLocaleLowerCase("en"));
      const seen = new Set<number>();
      const evidence = (participant?.evidence ?? []).flatMap((item) => {
        const source = messages[item.messageIndex];
        if (!source || source.author !== sourceParticipant.name || seen.has(item.messageIndex)) return [];
        seen.add(item.messageIndex);
        return [{ ...item, quote: evidenceExcerpt(source.body) }];
      });
      const behaviours = participant?.behaviours.length ? participant.behaviours : [sourceParticipant.share >= 35 ? "Frequently drives the conversation forward" : "Contributes selectively with distinctive timing"];
      if (evidence.length) return { ...sourceParticipant, behaviours, evidence };

      const fallbackIndex = messages.findIndex((message) => message.author === sourceParticipant.name && message.body.length > 8);
      if (fallbackIndex < 0) return { ...sourceParticipant, behaviours, evidence: [] };
      return {
        ...sourceParticipant,
        behaviours,
        evidence: [{
          messageIndex: fallbackIndex,
          quote: evidenceExcerpt(messages[fallbackIndex].body),
          observation: "A representative example of their contribution style",
        }],
      };
    }),
  };
}

export function analysisEvidenceIsAnchored(analysis: GenerationAnalysis, messages: SourceMessage[], sourceParticipants: SourceParticipant[]) {
  if (analysis.participants.length !== sourceParticipants.length) return false;
  return analysis.participants.every((participant, index) => {
    const sourceParticipant = sourceParticipants[index];
    if (!sourceParticipant || participant.name !== sourceParticipant.name || participant.messageCount !== sourceParticipant.messageCount || participant.share !== sourceParticipant.share) return false;
    return participant.evidence.every((item) => {
    const source = messages[item.messageIndex];
    return source?.author === participant.name && item.quote === evidenceExcerpt(source.body);
    });
  });
}
