import { reportSchema, type RoastReport } from "@/domain/report";

type SharePrivacy = { anonymizeNames: boolean; hideQuotes: boolean };

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceNames(value: unknown, replacements: Array<[string, string]>): unknown {
  if (typeof value === "string") {
    return replacements.reduce(
      (current, [name, replacement]) => current.replace(new RegExp(escapeRegExp(name), "giu"), replacement),
      value,
    );
  }
  if (Array.isArray(value)) return value.map((item) => replaceNames(item, replacements));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceNames(item, replacements)]));
  }
  return value;
}

export function prepareSharedReport(input: RoastReport, privacy: SharePrivacy) {
  let report = reportSchema.parse(structuredClone(input));
  if (privacy.anonymizeNames) {
    const replacements = report.participants
      .map((participant, index) => [participant.name, `Participant ${index + 1}`] as [string, string])
      .sort(([left], [right]) => right.length - left.length);
    report = reportSchema.parse(replaceNames(report, replacements));
    report.chatName = "Private chat";
  }
  if (privacy.hideQuotes) {
    report.participants = report.participants.map((participant) => ({ ...participant, evidence: [] }));
  }
  return report;
}
