'use server';

import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { withPermission } from '@/lib/auth/permissions';
import { createAuditLog } from '@/lib/audit';
import { llmClient } from '@/lib/api/llm';
import { successResponse, errorResponse, ApiResponse } from '@/lib/api/response';
import { generateReviewReplySchema, publishReviewReplySchema, GenerateReviewReplyInput, PublishReviewReplyInput } from './schemas';
import { calculateGbpCompletenessScore } from './scoring';
import { GbpReview, Prisma } from '@prisma/client';

export async function getGbpReviews(clientId: string): Promise<ApiResponse<GbpReview[]>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('gbp', 'read')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Permission denied for GBP module');
  }

  try {
    const reviews = await db.gbpReview.findMany({
      where: { clientId },
      orderBy: { fetchedAt: 'desc' },
    });
    return successResponse(reviews);
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to fetch GBP reviews', err);
  }
}

export async function generateAiReviewReply(input: GenerateReviewReplyInput): Promise<ApiResponse<string>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const parseResult = generateReviewReplySchema.safeParse(input);
  if (!parseResult.success) {
    return errorResponse('VALIDATION_ERROR', 'Invalid review reply input', parseResult.error.format());
  }

  const { reviewId, tone, customInstructions } = parseResult.data;

  try {
    const review = await db.gbpReview.findUnique({
      where: { id: reviewId },
      include: { client: true },
    });

    if (!review) return errorResponse('NOT_FOUND', 'Review not found');

    const prompt = `Write a ${tone.toLowerCase()} reply on behalf of business "${review.client.name}" to this Google Review by "${review.reviewerName}" (${review.rating} stars): "${review.comment || 'No comment text'}" ${customInstructions ? `Special instruction: ${customInstructions}` : ''}. Keep response concise (2-4 sentences), polite, and SEO-friendly.`;

    const result = await llmClient.generate({
      prompt,
      systemPrompt: 'You are an expert customer relations manager writing Google Business Profile review responses.',
    });

    await db.gbpReview.update({
      where: { id: reviewId },
      data: { replyText: result.content, replyStatus: 'DRAFTED' },
    });

    return successResponse(result.content);
  } catch (err: unknown) {
    return errorResponse('LLM_ERROR', 'Failed to generate review response', err);
  }
}

export async function publishReviewReply(input: PublishReviewReplyInput): Promise<ApiResponse<GbpReview>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('gbp', 'full')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Full permission required to publish replies');
  }

  const parseResult = publishReviewReplySchema.safeParse(input);
  if (!parseResult.success) {
    return errorResponse('VALIDATION_ERROR', 'Invalid publish input', parseResult.error.format());
  }

  const { reviewId, replyText } = parseResult.data;

  try {
    const updated = await db.gbpReview.update({
      where: { id: reviewId },
      data: {
        replyText,
        replyStatus: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });

    await createAuditLog({
      userId: session.user.id,
      action: 'UPDATE',
      resource: 'GbpReview',
      resourceId: reviewId,
      newData: { replyStatus: 'PUBLISHED', replyText },
    });

    return successResponse(updated);
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to publish review reply', err);
  }
}
