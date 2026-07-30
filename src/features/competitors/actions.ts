'use server';

import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { withPermission } from '@/lib/auth/permissions';
import { createAuditLog } from '@/lib/audit';
import { successResponse, errorResponse, ApiResponse } from '@/lib/api/response';
import { createCompetitorSchema, CreateCompetitorInput } from './schemas';
import { Competitor, Prisma } from '@prisma/client';

export type CompetitorWithClient = Prisma.CompetitorGetPayload<{
  include: { client: true };
}>;

export async function getCompetitors(clientId?: string): Promise<ApiResponse<CompetitorWithClient[]>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('competitors', 'read')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Permission denied for competitors module');
  }

  try {
    const competitors = await db.competitor.findMany({
      where: clientId ? { clientId } : undefined,
      include: { client: true },
      orderBy: { domainAuthority: 'desc' },
    });
    return successResponse(competitors as CompetitorWithClient[]);
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to fetch competitors', err);
  }
}

export async function addCompetitor(input: CreateCompetitorInput): Promise<ApiResponse<Competitor>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('competitors', 'full')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Full permission required to add competitors');
  }

  const parseResult = createCompetitorSchema.safeParse(input);
  if (!parseResult.success) {
    return errorResponse('VALIDATION_ERROR', 'Invalid competitor input', parseResult.error.format());
  }

  try {
    const competitor = await db.competitor.create({
      data: parseResult.data,
    });

    await createAuditLog({
      userId: session.user.id,
      action: 'CREATE',
      resource: 'Competitor',
      resourceId: competitor.id,
      newData: competitor,
    });

    return successResponse(competitor);
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to add competitor', err);
  }
}
