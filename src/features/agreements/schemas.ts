import { z } from 'zod';
import { AgreementStatus } from '@prisma/client';

export const createAgreementSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  clientId: z.string().min(1, 'Client is required'),
  monthlyFee: z.number().positive('Monthly fee must be positive'),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).optional(),
  deliverables: z.array(z.string()).default([]),
  content: z.string().min(10, 'Contract content is required'),
  status: z.nativeEnum(AgreementStatus).default(AgreementStatus.DRAFT),
});

export const updateAgreementSchema = createAgreementSchema.partial().extend({
  id: z.string(),
});

export type CreateAgreementInput = z.infer<typeof createAgreementSchema>;
export type UpdateAgreementInput = z.infer<typeof updateAgreementSchema>;
