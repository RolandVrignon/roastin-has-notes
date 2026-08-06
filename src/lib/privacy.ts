import type { ParsedConversation } from "@/domain/report";

const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const phonePattern = /(?<!\w)(?:\+?\d[\s().-]?){8,15}(?!\w)/g;
const minorPattern = /\b(?:i\s*am|i['’]?m|aged?|j['’]?ai|tengo)\s+(?:[1-9]|1[0-7])\s*(?:years? old|ans?|años?)?\b/i;

function redactText(value: string) {
  return value
    .replace(emailPattern, "[email redacted]")
    .replace(phonePattern, "[phone redacted]")
    .replace(/BEGIN:VCARD[\s\S]*?END:VCARD/gi, "[contact card redacted]");
}

function safeAuthor(author: string) {
  if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(author) || /(?:\+?\d[\s().-]?){8,15}/.test(author)) return "Participant";
  return author.replace(emailPattern, "Participant").replace(phonePattern, "Participant").slice(0, 40);
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
