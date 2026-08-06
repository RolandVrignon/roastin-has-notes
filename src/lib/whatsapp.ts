import type { ChatMessage, ParsedConversation } from "@/domain/report";

const bracketPattern = /^\[(\d{1,2})[/.](\d{1,2})[/.](\d{2,4}),?\s+(\d{1,2}):(\d{2})(?::\d{2})?\s*([AP]M)?\]\s*([^:]+):\s([\s\S]*)$/i;
const dashPattern = /^(\d{1,2})[/.](\d{1,2})[/.](\d{2,4}),?\s+(\d{1,2}):(\d{2})(?::\d{2})?\s*([AP]M)?\s+-\s+([^:]+):\s([\s\S]*)$/i;

type DateOrder = "dmy" | "mdy";

function makeDate(parts: RegExpMatchArray, order: DateOrder) {
  const first = Number(parts[1]);
  const second = Number(parts[2]);
  const day = order === "dmy" ? first : second;
  const month = (order === "dmy" ? second : first) - 1;
  const rawYear = Number(parts[3]);
  const year = rawYear < 100 ? 2000 + rawYear : rawYear;
  let hour = Number(parts[4]);
  const meridiem = parts[6]?.toUpperCase();
  if (meridiem === "PM" && hour < 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;
  const date = new Date(year, month, day, hour, Number(parts[5]));
  return Number.isNaN(date.getTime()) || date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day ? null : date;
}

function normalizeAuthor(author: string) {
  return author.replace(/[\u200e\u200f]/g, "").trim().slice(0, 80);
}

export function parseWhatsApp(text: string): ParsedConversation {
  const messages: ChatMessage[] = [];
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const datePairs = lines.flatMap((line) => {
    const match = line.match(bracketPattern) ?? line.match(dashPattern);
    return match ? [[Number(match[1]), Number(match[2])]] : [];
  });
  const order: DateOrder = datePairs.some(([first]) => first > 12) ? "dmy" : datePairs.some(([, second]) => second > 12) ? "mdy" : "dmy";
  for (const line of lines) {
    const match = line.match(bracketPattern) ?? line.match(dashPattern);
    if (match) {
      messages.push({ author: normalizeAuthor(match[7]), body: match[8].trim(), date: makeDate(match, order) });
      continue;
    }
    if (messages.length && line.trim()) messages[messages.length - 1].body += `\n${line.trim()}`;
  }

  const visibleMessages = messages.filter(({ body }) => !/^<media omitted>|image omitted|video omitted|audio omitted$/i.test(body));
  const counts = new Map<string, number>();
  for (const message of visibleMessages) counts.set(message.author, (counts.get(message.author) ?? 0) + 1);
  const total = visibleMessages.length || 1;
  const participants = [...counts.entries()]
    .map(([name, messageCount]) => ({ name, messageCount, share: Math.round((messageCount / total) * 1000) / 10 }))
    .sort((a, b) => b.messageCount - a.messageCount);
  const dates = visibleMessages.map((message) => message.date).filter((date): date is Date => Boolean(date));
  return {
    messages: visibleMessages,
    participants,
    firstDate: dates.length ? new Date(Math.min(...dates.map(Number))) : null,
    lastDate: dates.length ? new Date(Math.max(...dates.map(Number))) : null,
  };
}

export function formatDateRange(first: Date | null, last: Date | null, locale = "en") {
  if (!first || !last) return "Dates unknown";
  const formatter = new Intl.DateTimeFormat(locale, { month: "short", year: "numeric" });
  return `${formatter.format(first)} — ${formatter.format(last)}`;
}
