export type ReportEvidence = { message: string; note: string | null; isQuote: boolean };

export function parseReportEvidence(value: string): ReportEvidence {
  const evidence = value.trim();
  const guillemet = evidence.match(/^«\s*([\s\S]*?)\s*»(?:\s*[:—-]\s*([\s\S]+))?$/u);
  if (guillemet?.[1]) return { message: guillemet[1].trim(), note: guillemet[2]?.trim() || null, isQuote: true };
  const quotation = evidence.match(/^[“"]\s*([\s\S]*?)\s*[”"](?:\s*[:—-]\s*([\s\S]+))?$/u);
  if (quotation?.[1]) return { message: quotation[1].trim(), note: quotation[2]?.trim() || null, isQuote: true };
  return { message: evidence, note: null, isQuote: false };
}
