import { z } from 'zod';

export const postTypeEnum = z.enum(['PROMOTIONAL', 'EDUCATIONAL', 'OFFER', 'EVENT']);

export const generateCaptionSchema = z.object({
  clientId: z.string().min(1, 'Client ID required'),
  postType: postTypeEnum,
  topic: z.string().min(2, 'Topic description required'),
  targetKeywords: z.array(z.string()).optional(),
  callToAction: z.string().optional(),
});

export const createPostSchema = z.object({
  clientId: z.string().min(1, 'Client ID required'),
  postType: postTypeEnum,
  caption: z.string().min(5, 'Caption must be at least 5 characters').max(1500, 'GBP captions limited to 1500 chars'),
  imageUrl: z.string().optional(),
  scheduledFor: z.string().optional(), // ISO date string
});

export type GenerateCaptionInput = z.infer<typeof generateCaptionSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
