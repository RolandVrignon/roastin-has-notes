import { z } from "zod";

export const generationAnalysisSchema = z.object({
  participants: z.array(z.object({
    name: z.string(),
    messageCount: z.number().int().nonnegative(),
    share: z.number().min(0).max(100),
    behaviours: z.array(z.string()).min(1).max(5),
    evidence: z.array(z.object({ quote: z.string(), observation: z.string() })).max(3),
  })).min(2),
  recurringPatterns: z.array(z.string()).min(2).max(8),
  groupDynamics: z.array(z.string()).min(2).max(8),
  vocabulary: z.array(z.object({ term: z.string(), meaning: z.string() })).max(8),
  safety: z.object({ approved: z.literal(true), notes: z.array(z.string()).max(5) }),
});

export type GenerationAnalysis = z.infer<typeof generationAnalysisSchema>;
