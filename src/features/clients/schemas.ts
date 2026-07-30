import { z } from 'zod';
import { ClientStatus } from '@prisma/client';

export const createClientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  domain: z.string().min(3, 'Domain is required').regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid domain format'),
  industry: z.string().optional(),
  status: z.nativeEnum(ClientStatus).default(ClientStatus.ACTIVE),
  primaryColor: z.string().default('#3b82f6'),
  managerId: z.string().optional(),
});

export const updateClientSchema = createClientSchema.partial().extend({
  id: z.string(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
