import { z } from 'zod';

export const generateGridSchema = z.object({
  clientId: z.string().min(1, 'Client ID required'),
  keyword: z.string().min(2, 'Keyword required'),
  centerLat: z.number().min(-90).max(90),
  centerLng: z.number().min(-180).max(180),
  gridSize: z.union([z.literal(3), z.literal(5), z.literal(7)]).default(5),
  radiusMiles: z.number().min(0.5).max(50).default(5),
});

export type GenerateGridInput = z.infer<typeof generateGridSchema>;
