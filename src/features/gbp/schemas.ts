import { z } from 'zod';

export const generateReviewReplySchema = z.object({
  reviewId: z.string().min(1, 'Review ID is required'),
  tone: z.enum(['PROFESSIONAL', 'FRIENDLY', 'APOLOGETIC', 'GRATITUDE']).default('PROFESSIONAL'),
  customInstructions: z.string().optional(),
});

export const publishReviewReplySchema = z.object({
  reviewId: z.string().min(1, 'Review ID is required'),
  replyText: z.string().min(2, 'Reply text cannot be empty'),
});

export type GenerateReviewReplyInput = z.infer<typeof generateReviewReplySchema>;
export type PublishReviewReplyInput = z.infer<typeof publishReviewReplySchema>;
