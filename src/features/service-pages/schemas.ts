import { z } from 'zod';

export const generateServicePageSchema = z.object({
  clientId: z.string().min(1, 'Client ID required'),
  serviceName: z.string().min(2, 'Service name required'),
  targetCity: z.string().min(2, 'Target city required'),
  primaryKeyword: z.string().min(2, 'Primary keyword required'),
});

export type GenerateServicePageInput = z.infer<typeof generateServicePageSchema>;
