import { z } from 'zod';

export const generateGridSchema = z.object({
  clientId: z.string().min(1, 'Client ID required'),
  keywords: z.array(z.string().min(2, 'Keyword must be at least 2 characters')).min(1, 'At least one keyword is required'),
  address: z.string().optional(),
  centerLat: z.number().min(-90).max(90).optional(),
  centerLng: z.number().min(-180).max(180).optional(),
  gridSize: z.union([z.literal(3), z.literal(5), z.literal(7)]).default(5),
  radiusMiles: z.number().min(0.1).max(50).default(2.0),
  geocoder: z.enum(['google', 'nominatim', 'mapbox']).default('nominatim'),
  isCustomSearch: z.boolean().default(false),
  targetPlaceId: z.string().optional(),
  targetName: z.string().optional(),
  targetDomain: z.string().optional(),
});

export type GenerateGridInput = z.infer<typeof generateGridSchema>;

