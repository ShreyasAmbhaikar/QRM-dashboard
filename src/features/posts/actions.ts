'use server';

import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { withPermission } from '@/lib/auth/permissions';
import { createAuditLog } from '@/lib/audit';
import { llmClient } from '@/lib/api/llm';
import { successResponse, errorResponse, ApiResponse } from '@/lib/api/response';
import { generateCaptionSchema, createPostSchema, GenerateCaptionInput, CreatePostInput } from './schemas';
import { renderTemplateSvg } from './graphics/mode-b/template-engine';
import { Post } from '@prisma/client';

export async function generatePostCaption(input: GenerateCaptionInput): Promise<ApiResponse<string>> {
  const session = await auth();
  if (!session?.user?.id) return errorResponse('UNAUTHORIZED', 'Auth required');

  const parseResult = generateCaptionSchema.safeParse(input);
  if (!parseResult.success) {
    return errorResponse('VALIDATION_ERROR', 'Invalid caption request', parseResult.error.format());
  }

  const { clientId, postType, topic, targetKeywords, callToAction } = parseResult.data;

  try {
    const client = await db.client.findUnique({ where: { id: clientId } });
    if (!client) return errorResponse('NOT_FOUND', 'Client not found');

    const prompt = `Write a Google Business Profile ${postType} post for "${client.name}" (Domain: ${client.domain}). 
Topic: ${topic}. 
Target Keywords: ${targetKeywords?.join(', ') || 'Local SEO'}. 
Call to Action: ${callToAction || 'Call us today!'}. 
Keep under 1000 characters. Include engaging emojis and clear local search intent.`;

    const result = await llmClient.generate({
      prompt,
      systemPrompt: 'You are a local SEO copywriter specializing in Google Business Profile updates.',
    });

    return successResponse(result.content);
  } catch (err: unknown) {
    return errorResponse('LLM_ERROR', 'Failed to generate post caption', err);
  }
}

export async function generateBrandedGraphic(headline: string, brandColor?: string): Promise<ApiResponse<string>> {
  const session = await auth();
  if (!session?.user?.id) return errorResponse('UNAUTHORIZED', 'Auth required');

  try {
    const svgContent = await renderTemplateSvg({ headline, brandColor });
    return successResponse(svgContent);
  } catch (err: unknown) {
    return errorResponse('GRAPHIC_ERROR', 'Failed to render graphic template', err);
  }
}

export async function createGbpPost(input: CreatePostInput): Promise<ApiResponse<Post>> {
  const session = await auth();
  if (!session?.user?.id) return errorResponse('UNAUTHORIZED', 'Auth required');

  const hasPermission = await withPermission('gbp', 'full')(session.user.id);
  if (!hasPermission) return errorResponse('FORBIDDEN', 'Full permission required to schedule posts');

  const parseResult = createPostSchema.safeParse(input);
  if (!parseResult.success) return errorResponse('VALIDATION_ERROR', 'Invalid post input', parseResult.error.format());

  const { clientId, postType, caption, imageUrl, scheduledFor } = parseResult.data;

  try {
    const postStatus = scheduledFor ? 'SCHEDULED' : 'PUBLISHED';
    const scheduledDate = scheduledFor ? new Date(scheduledFor) : null;

    const post = await db.post.create({
      data: {
        clientId,
        title: `${postType} GBP Update`,
        summary: caption,
        imageUrl,
        status: postStatus,
        scheduledFor: scheduledDate,
        publishedAt: postStatus === 'PUBLISHED' ? new Date() : null,
        createdById: session.user.id,
      },
    });

    await createAuditLog({
      userId: session.user.id,
      action: 'CREATE',
      resource: 'Post',
      resourceId: post.id,
      newData: { status: postStatus },
    });

    return successResponse(post);
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to create post', err);
  }
}
