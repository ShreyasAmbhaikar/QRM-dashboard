import { z } from 'zod';

export const RunPerformanceCheckSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
});

export type RunPerformanceCheckInput = z.infer<typeof RunPerformanceCheckSchema>;
