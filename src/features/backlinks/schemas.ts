import { z } from 'zod';

export const AddBacklinkSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  referringDomain: z.string().min(1, 'Referring domain is required'),
  targetUrl: z.string().min(1, 'Target URL is required'),
  anchorText: z.string().optional(),
  domainAuthority: z.number().int().min(0).max(100).default(10),
  isToxic: z.boolean().default(false),
});

export type AddBacklinkInput = z.infer<typeof AddBacklinkSchema>;
