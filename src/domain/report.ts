import { z } from "zod";

export const personalitySchema = z.object({
  archetype: z.string(),
  summary: z.string(),
  traits: z.array(z.string()).min(2).max(4),
  strength: z.string(),
  chaosTrigger: z.string(),
});

export const participantSchema = z.object({
  name: z.string(),
  messageCount: z.number().int().nonnegative(),
  share: z.number().min(0).max(100),
  title: z.string(),
  portrait: z.string(),
  evidence: z.array(z.string()).max(3),
  finalLine: z.string(),
  personality: personalitySchema.optional(),
});

export const reportSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  chatName: z.string(),
  locale: z.string(),
  createdAt: z.string(),
  stats: z.object({
    messageCount: z.number().int().nonnegative(),
    participantCount: z.number().int().nonnegative(),
    dateRange: z.string(),
  }),
  opening: z.string(),
  participants: z.array(participantSchema),
  awards: z.array(z.object({ title: z.string(), winner: z.string(), reason: z.string() })),
  dictionary: z.array(z.object({ term: z.string(), meaning: z.string() })),
  dynamics: z.array(z.string()),
  flags: z.object({ green: z.array(z.string()), yellow: z.array(z.string()), red: z.array(z.string()) }),
  reactions: z.array(z.object({ name: z.string(), reaction: z.string() })),
  finalVerdict: z.string(),
});

export const reportContentSchema = reportSchema.omit({ id: true, chatName: true, locale: true, createdAt: true, stats: true });
export const generatedReportContentSchema = reportContentSchema.extend({
  participants: z.array(participantSchema.extend({ personality: personalitySchema })),
});

export type RoastReport = z.infer<typeof reportSchema>;

export type ChatMessage = {
  author: string;
  body: string;
  date: Date | null;
};

export type ParsedConversation = {
  messages: ChatMessage[];
  participants: Array<{ name: string; messageCount: number; share: number }>;
  firstDate: Date | null;
  lastDate: Date | null;
};
