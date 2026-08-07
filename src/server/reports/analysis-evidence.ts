import type { GenerationAnalysis } from "./generation-schemas";

type SourceMessage = { author: string; body: string };

export function anchorAnalysisEvidence(analysis: GenerationAnalysis, messages: SourceMessage[]): GenerationAnalysis {
  return {
    ...analysis,
    participants: analysis.participants.map((participant) => {
      const seen = new Set<number>();
      const evidence = participant.evidence.flatMap((item) => {
        const source = messages[item.messageIndex];
        if (!source || source.author !== participant.name || seen.has(item.messageIndex)) return [];
        seen.add(item.messageIndex);
        return [{ ...item, quote: source.body.slice(0, 160) }];
      });
      if (evidence.length) return { ...participant, evidence };

      const fallbackIndex = messages.findIndex((message) => message.author === participant.name && message.body.length > 8);
      if (fallbackIndex < 0) return { ...participant, evidence: [] };
      return {
        ...participant,
        evidence: [{
          messageIndex: fallbackIndex,
          quote: messages[fallbackIndex].body.slice(0, 160),
          observation: "A representative example of their contribution style",
        }],
      };
    }),
  };
}

export function analysisEvidenceIsAnchored(analysis: GenerationAnalysis, messages: SourceMessage[]) {
  return analysis.participants.every((participant) => participant.evidence.every((item) => {
    const source = messages[item.messageIndex];
    return source?.author === participant.name && item.quote === source.body.slice(0, 160);
  }));
}
