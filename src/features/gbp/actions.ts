'use server';

import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { withPermission } from '@/lib/auth/permissions';
import { createAuditLog } from '@/lib/audit';
import { decrypt } from '@/lib/crypto';
import { llmClient } from '@/lib/api/llm';
import { successResponse, errorResponse, ApiResponse } from '@/lib/api/response';
import { generateReviewReplySchema, publishReviewReplySchema, GenerateReviewReplyInput, PublishReviewReplyInput } from './schemas';
import { calculateGbpCompletenessScore } from './scoring';
import { GbpReview, Client } from '@prisma/client';
import { GbpApiClient, GbpLocationDetails } from '@/lib/api/gbp';
import { cookies } from 'next/headers';

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

export interface ImportGbpLocationSelection {
  locationId: string;
  name: string;
  websiteUrl?: string;
  clientMapping: 'NEW' | string; // 'NEW' or clientId
}

export async function getPendingGoogleLocations(connectionId: string): Promise<ApiResponse<{
  locations: GbpLocationDetails[];
  clients: Client[];
}>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  try {
    const pending = await db.pendingGoogleConnection.findUnique({
      where: { id: connectionId },
    });

    if (!pending) {
      return errorResponse('NOT_FOUND', 'Pending connection not found or expired');
    }

    const rawAccessToken = decrypt(pending.accessToken);
    const apiClient = new GbpApiClient(rawAccessToken);
    const locations = await apiClient.getAccountLocations();

    const clients = await db.client.findMany({
      orderBy: { name: 'asc' },
    });

    return successResponse({ locations, clients });
  } catch (err: any) {
    return errorResponse('DATABASE_ERROR', err?.message || 'Failed to retrieve pending locations', err);
  }
}

export async function importGbpLocations(
  connectionId: string,
  selections: ImportGbpLocationSelection[]
): Promise<ApiResponse<{ importedCount: number }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('gbp', 'full')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Full permission required to import locations');
  }

  if (!selections || selections.length === 0) {
    return errorResponse('VALIDATION_ERROR', 'No locations selected for import');
  }

  try {
    const pending = await db.pendingGoogleConnection.findUnique({
      where: { id: connectionId },
    });

    if (!pending) {
      return errorResponse('NOT_FOUND', 'Pending connection not found or expired');
    }

    let importedCount = 0;

    for (const selection of selections) {
      let targetClientId = selection.clientMapping;

      if (targetClientId === 'NEW') {
        // Generate a clean domain name from websiteUrl or use a fallback
        let domain = selection.websiteUrl 
          ? selection.websiteUrl.replace(/https?:\/\/(www\.)?/, '').split('/')[0]
          : `${selection.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;

        // If the domain is empty or invalid, generate random domain
        if (!domain || domain.trim() === '') {
          domain = `client-${Date.now()}.com`;
        }

        // Verify if client domain is already registered
        const existingClientByDomain = await db.client.findUnique({
          where: { domain },
        });

        if (existingClientByDomain) {
          domain = `${Date.now()}-${domain}`;
        }

        const newClient = await db.client.create({
          data: {
            name: selection.name,
            domain,
            status: 'ACTIVE',
            healthScore: 100,
            primaryColor: '#3b82f6',
          },
        });
        targetClientId = newClient.id;
      }

      // Upsert GBP Integration for this client
      await db.gbpIntegration.upsert({
        where: { clientId: targetClientId },
        create: {
          clientId: targetClientId,
          locationId: selection.locationId,
          accessToken: pending.accessToken,
          refreshToken: pending.refreshToken,
          expiryDate: pending.expiryDate,
        },
        update: {
          locationId: selection.locationId,
          accessToken: pending.accessToken,
          refreshToken: pending.refreshToken,
          expiryDate: pending.expiryDate,
          lastSyncedAt: new Date(),
        },
      });

      importedCount++;
    }

    // Delete the pending connection after successful imports
    await db.pendingGoogleConnection.delete({
      where: { id: connectionId },
    });

    await createAuditLog({
      userId: session.user.id,
      action: 'CREATE',
      resource: 'GbpIntegration',
      resourceId: connectionId,
      newData: { importedCount, selections },
    });

    return successResponse({ importedCount });
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to import selected locations', err);
  }
}

export async function getConnectedClientsAction(): Promise<ApiResponse<{ id: string; name: string }[]>> {
  try {
    const clients = await db.client.findMany({
      where: {
        gbpIntegration: { isNot: null },
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    });
    return successResponse(clients);
  } catch (err: any) {
    return errorResponse('DATABASE_ERROR', err?.message || 'Failed to fetch connected clients', err);
  }
}

export async function setActiveClientAction(clientId: string): Promise<ApiResponse<{ success: boolean }>> {
  try {
    const cookieStore = await cookies();
    cookieStore.set('gbp_active_client', clientId, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      httpOnly: false, // Access from client components is allowed
      sameSite: 'lax',
    });
    return successResponse({ success: true });
  } catch (err: any) {
    return errorResponse('DATABASE_ERROR', err?.message || 'Failed to set active client', err);
  }
}
