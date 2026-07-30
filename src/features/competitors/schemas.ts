import { z } from 'zod';

export const createCompetitorSchema = z.object({
  domain: z.string().min(3, 'Domain is required'),
  clientId: z.string().min(1, 'Client selection is required'),
  domainAuthority: z.number().default(0),
  organicKeywords: z.number().default(0),
  backlinks: z.number().default(0),
});

export type CreateCompetitorInput = z.infer<typeof createCompetitorSchema>;
