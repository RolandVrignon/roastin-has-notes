import { randomUUID } from "node:crypto";
import type { ParsedConversation, RoastReport } from "@/domain/report";
import { formatDateRange } from "@/lib/whatsapp";

const titles = ["The Unofficial Project Manager", "Chief Reaction Officer", "The Plot Twist Department", "Director of Strategic Disappearing", "Keeper of the Lore"];

export function createFallbackReport(conversation: ParsedConversation, chatName: string, locale: string): RoastReport {
  const top = conversation.participants[0]?.name ?? "Someone";
  const quiet = conversation.participants.at(-1)?.name ?? top;
  const participants = conversation.participants.map((participant, index) => {
    const evidence = conversation.messages.filter((message) => message.author === participant.name && message.body.length > 12).slice(0, 2).map((message) => message.body.slice(0, 120));
    return {
      ...participant,
      title: titles[index % titles.length],
      portrait: `${participant.name} contributes ${participant.share}% of the chat and has somehow turned that into a full-time personality trait. ${index === 0 ? "If this group has a steering wheel, they are holding it." : "They may not run the chat, but the timing of their entrances deserves its own study."}`,
      evidence,
      finalLine: index === 0 ? "Not controlling. Just correctly concerned that nobody else made a plan." : "Present when the plot needs them, mysteriously offline when logistics appear.",
    };
  });

  return {
    id: randomUUID(),
    title: `${chatName}: A Beautifully Managed Disaster`,
    subtitle: "A forensic reading of the plans, disappearances and deeply unnecessary voice notes.",
    chatName,
    locale,
    createdAt: new Date().toISOString(),
    stats: { messageCount: conversation.messages.length, participantCount: conversation.participants.length, dateRange: formatDateRange(conversation.firstDate, conversation.lastDate, locale) },
    opening: `${chatName} is held together by affection, repeated questions nobody answers, and ${top}'s refusal to let a plan die quietly. It works. Nobody knows why, but it works.`,
    participants,
    awards: [
      { title: "Most likely to make the plan real", winner: top, reason: "Message volume says leadership. The follow-ups say mild exhaustion." },
      { title: "Best surprise appearance", winner: quiet, reason: "Low frequency. Maximum narrative impact." },
      { title: "The ‘on my way’ lifetime achievement award", winner: participants[1]?.name ?? top, reason: "The committee checked the timestamps. The committee has concerns." },
    ],
    dictionary: [
      { term: "We should", meaning: "This will not happen without a second, more serious message." },
      { term: "Hahaha", meaning: "Acknowledged. No further action will be taken." },
      { term: "On my way", meaning: "A broad statement of future intent." },
    ],
    dynamics: [`${top} creates momentum; everyone else creates texture.`, "Plans require at least three separate emotional phases before becoming calendar events.", "Silence is not absence. It is usually someone preparing a reaction emoji."],
    flags: { green: ["You keep returning to each other", "The group has a shared language outsiders would not survive"], yellow: ["Questions regularly become archaeological artefacts", "Planning depends on one suspiciously competent person"], red: ["‘On my way’ appears to be legally non-binding"] },
    reactions: participants.map((participant, index) => ({ name: participant.name, reaction: index === 0 ? "Will send three corrections, then quietly save the report." : index === participants.length - 1 ? "Will read every word and respond with one emoji." : "Will deny it before quoting their favourite section." })),
    finalVerdict: `${chatName} is a tiny institution with no constitution, inconsistent office hours, and surprisingly excellent retention. The chaos is not a bug. It is the group culture.`,
  };
}
