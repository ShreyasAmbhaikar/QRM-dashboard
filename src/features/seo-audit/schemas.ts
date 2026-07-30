import { z } from 'zod';

export const TriggerAuditSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  domainUrl: z.string().min(1, 'Domain URL is required'),
});

export type TriggerAuditInput = z.infer<typeof TriggerAuditSchema>;
