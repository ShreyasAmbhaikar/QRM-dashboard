import { z } from 'zod';

export const createKeywordSchema = z.object({
  term: z.string().min(1, 'Keyword term is required'),
  clientId: z.string().min(1, 'Client selection is required'),
  searchVolume: z.number().default(0),
  cpc: z.number().default(0),
  difficulty: z.number().default(0),
  currentRank: z.number().optional(),
  targetRank: z.number().default(1),
  intent: z.string().default('Commercial'),
});

export const searchKeywordsSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
});

export type CreateKeywordInput = z.infer<typeof createKeywordSchema>;
