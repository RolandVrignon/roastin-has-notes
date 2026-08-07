import type { ParsedConversation } from "@/domain/report";

const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const phoneCandidatePattern = /(?<!\w)\+?\d[\d\s().-]{6,30}\d(?!\w)/g;
const minorPattern = /\b(?:(?:i\s*am|i['’]?m)\s+(?:[1-9]|1[0-7])\s+years?\s+old|(?:age|aged)\s+(?:[1-9]|1[0-7])(?:\s+years?\s+old)?|j['’]?ai\s+(?:[1-9]|1[0-7])\s+ans?|tengo\s+(?:[1-9]|1[0-7])\s+años?)\b/i;

function redactText(value: string) {
  return value
    .replace(emailPattern, "[email redacted]")
    .replace(phoneCandidatePattern, (candidate) => {
      const digitCount = candidate.replace(/\D/g, "").length;
      return digitCount >= 8 && digitCount <= 15 ? "[phone redacted]" : candidate;
    })
    .replace(/BEGIN:VCARD[\s\S]*?END:VCARD/gi, "[contact card redacted]");
}

function safeAuthor(author: string) {
  const redacted = redactText(author);
  if (redacted !== author) return "Participant";
  return author.slice(0, 40);
}

export function sanitizeConversation(conversation: ParsedConversation): ParsedConversation {
  const messages = conversation.messages.map((message) => ({ ...message, author: safeAuthor(message.author), body: redactText(message.body) }));
  const counts = new Map<string, number>();
  for (const message of messages) counts.set(message.author, (counts.get(message.author) ?? 0) + 1);
  const total = messages.length || 1;
  const participants = [...counts].map(([name, messageCount]) => ({ name, messageCount, share: Math.round(messageCount / total * 1000) / 10 })).sort((a, b) => b.messageCount - a.messageCount);
  return { ...conversation, messages, participants };
}

export function hasMinorSignal(conversation: ParsedConversation) {
  return conversation.messages.some((message) => minorPattern.test(message.body));
}
