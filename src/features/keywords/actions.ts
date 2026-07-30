'use server';

import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { withPermission } from '@/lib/auth/permissions';
import { createAuditLog } from '@/lib/audit';
import { dataForSeoClient, KeywordSearchMetrics } from '@/lib/api/dataforseo';
import { successResponse, errorResponse, ApiResponse } from '@/lib/api/response';
import { createKeywordSchema, CreateKeywordInput } from './schemas';
import { Keyword, Prisma } from '@prisma/client';

export type KeywordWithRelations = Prisma.KeywordGetPayload<{
  include: { client: true };
}>;

export async function getKeywords(clientId?: string): Promise<ApiResponse<KeywordWithRelations[]>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('keywords', 'read')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Permission denied for keywords module');
  }

  try {
    const keywords = await db.keyword.findMany({
      where: clientId ? { clientId } : undefined,
      include: { client: true },
      orderBy: { currentRank: 'asc' },
    });

    return successResponse(keywords as KeywordWithRelations[]);
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to fetch keywords', err);
  }
}

export async function searchKeywordIdeas(query: string): Promise<ApiResponse<KeywordSearchMetrics[]>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  try {
    const terms = [query, `${query} services`, `best ${query}`, `affordable ${query} near me`];
    const metrics = await dataForSeoClient.getSearchVolume(terms);
    return successResponse(metrics);
  } catch (err: unknown) {
    return errorResponse('API_ERROR', 'Failed to fetch keyword search metrics', err);
  }
}

export async function addKeywordToTracker(input: CreateKeywordInput): Promise<ApiResponse<Keyword>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('keywords', 'full')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Full permission required to add keywords');
  }

  const parseResult = createKeywordSchema.safeParse(input);
  if (!parseResult.success) {
    return errorResponse('VALIDATION_ERROR', 'Invalid keyword input', parseResult.error.format());
  }

  try {
    const keyword = await db.keyword.create({
      data: parseResult.data,
    });

    if (keyword.currentRank) {
      await db.keywordRankHistory.create({
        data: {
          keywordId: keyword.id,
          rank: keyword.currentRank,
        },
      });
    }

    await createAuditLog({
      userId: session.user.id,
      action: 'CREATE',
      resource: 'Keyword',
      resourceId: keyword.id,
      newData: keyword,
    });

    return successResponse(keyword);
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to add keyword', err);
  }
}
