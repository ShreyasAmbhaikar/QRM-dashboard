import { z } from 'zod';
import { AgreementStatus } from '@prisma/client';

export const createAgreementSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  clientId: z.string().min(1, 'Client is required'),
  monthlyFee: z.number().positive('Monthly fee must be positive'),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).optional().nullable(),
  deliverables: z.array(z.string()).default([]),
  content: z.string().min(10, 'Contract content is required'),
  status: z.nativeEnum(AgreementStatus).default(AgreementStatus.DRAFT),
  companyName: z.string().optional(),
  companyEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  companyPhone: z.string().optional(),
  companyWebsite: z.string().optional(),
  clientSignature: z.string().optional().nullable(),
  clientSignedName: z.string().optional().nullable(),
  clientSignedAt: z.string().or(z.date()).optional().nullable(),
  providerSignature: z.string().optional().nullable(),
  providerSignedName: z.string().optional().nullable(),
  providerSignedAt: z.string().or(z.date()).optional().nullable(),
});

export const updateAgreementSchema = createAgreementSchema.partial().extend({
  id: z.string(),
});

export type CreateAgreementInput = z.infer<typeof createAgreementSchema>;
export type UpdateAgreementInput = z.infer<typeof updateAgreementSchema>;
