import { parseReportEvidence } from "@/lib/report-evidence";

export type PortraitBlock =
  | { type: "text"; text: string }
  | { type: "evidence"; evidence: string };

type AnchoredEvidence = {
  evidence: string;
  message: string;
  start: number;
  end: number;
};

function cleanText(value: string) {
  const withoutQuoteMarkers = value
    .replace(/[«“"]\s*$/u, "")
    .replace(/\s*[—–-]\s*$/u, "")
    .replace(/^\s*[»”"]/u, "")
    .replace(/^[\s.,;:!?…—–-]+/u, "")
    .trim();

  return withoutQuoteMarkers.replace(/^\p{Ll}/u, (letter) => letter.toLocaleUpperCase());
}

function textBlock(value: string): PortraitBlock | null {
  const text = cleanText(value);
  return text ? { type: "text", text } : null;
}

function splitSentences(value: string) {
  return value
    .split(/(?<=[.!?…])\s+(?=[\p{Lu}\p{N}])/u)
    .map((sentence) => cleanText(sentence))
    .filter(Boolean);
}

function interleaveUnanchored(text: string, evidence: string[]): PortraitBlock[] {
  const sentences = splitSentences(text);
  if (sentences.length < 2) {
    const narrative = textBlock(text);
    return [...(narrative ? [narrative] : []), ...evidence.map((item) => ({ type: "evidence" as const, evidence: item }))];
  }

  const positions = evidence.map((_, index) => Math.min(
    sentences.length - 2,
    Math.max(0, Math.floor(((index + 1) * sentences.length) / (evidence.length + 1)) - 1),
  ));
  const blocks: PortraitBlock[] = [];

  sentences.forEach((sentence, sentenceIndex) => {
    blocks.push({ type: "text", text: sentence });
    evidence.forEach((item, evidenceIndex) => {
      if (positions[evidenceIndex] === sentenceIndex) blocks.push({ type: "evidence", evidence: item });
    });
  });
  return blocks;
}

export function buildPortraitBlocks(portrait: string, evidence: string[]): PortraitBlock[] {
  const anchored: AnchoredEvidence[] = [];
  const unanchored: string[] = [];

  for (const item of evidence) {
    const parsed = parseReportEvidence(item);
    if (!parsed.isQuote) {
      unanchored.push(item);
      continue;
    }

    const start = portrait.indexOf(parsed.message);
    if (start < 0) {
      unanchored.push(item);
      continue;
    }
    anchored.push({ evidence: item, message: parsed.message, start, end: start + parsed.message.length });
  }

  anchored.sort((left, right) => left.start - right.start);
  const nonOverlapping: AnchoredEvidence[] = [];
  for (const item of anchored) {
    if (nonOverlapping.length === 0 || item.start >= nonOverlapping.at(-1)!.end) nonOverlapping.push(item);
    else unanchored.push(item.evidence);
  }

  if (nonOverlapping.length === 0) return interleaveUnanchored(portrait, unanchored);

  const blocks: PortraitBlock[] = [];
  let cursor = 0;
  for (const item of nonOverlapping) {
    const narrative = textBlock(portrait.slice(cursor, item.start));
    if (narrative) blocks.push(narrative);
    blocks.push({ type: "evidence", evidence: item.evidence });
    cursor = item.end;
  }
  const remainingNarrative = textBlock(portrait.slice(cursor));
  if (remainingNarrative) blocks.push(remainingNarrative);

  if (unanchored.length === 0) return blocks;
  const finalTextIndex = blocks.findLastIndex((block) => block.type === "text");
  blocks.splice(finalTextIndex < 0 ? blocks.length : finalTextIndex, 0, ...unanchored.map((item) => ({ type: "evidence" as const, evidence: item })));
  return blocks;
}
