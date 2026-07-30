import { z } from 'zod';
import { LeadStatus } from '@prisma/client';

export const createLeadSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  contactName: z.string().min(2, 'Contact name is required'),
  email: z.string().email('Valid email address is required'),
  phone: z.string().optional(),
  website: z.string().optional(),
  status: z.nativeEnum(LeadStatus).default(LeadStatus.NEW),
  notes: z.string().optional(),
  estimatedBudget: z.number().optional(),
});

export const updateLeadSchema = createLeadSchema.partial().extend({
  id: z.string(),
});

export const leadFilterSchema = z.object({
  status: z.nativeEnum(LeadStatus).optional(),
  search: z.string().optional(),
  minScore: z.number().optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type LeadFilterInput = z.infer<typeof leadFilterSchema>;
