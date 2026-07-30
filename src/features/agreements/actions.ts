'use server';

import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { withPermission } from '@/lib/auth/permissions';
import { createAuditLog } from '@/lib/audit';
import { createNotification } from '@/lib/notifications';
import { successResponse, errorResponse, ApiResponse } from '@/lib/api/response';
import { createAgreementSchema, updateAgreementSchema, CreateAgreementInput, UpdateAgreementInput } from './schemas';
import { Agreement, AgreementStatus, Prisma } from '@prisma/client';

export type AgreementWithClient = Prisma.AgreementGetPayload<{
  include: { client: true };
}>;

export async function getAgreements(): Promise<ApiResponse<AgreementWithClient[]>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('agreements', 'read')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Permission denied for agreements module');
  }

  try {
    const agreements = await db.agreement.findMany({
      include: { client: true },
      orderBy: { updatedAt: 'desc' },
    });
    return successResponse(agreements as AgreementWithClient[]);
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to fetch agreements', err);
  }
}

export async function getAgreementById(id: string): Promise<ApiResponse<AgreementWithClient>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('agreements', 'read')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Permission denied for agreements module');
  }

  try {
    const agreement = await db.agreement.findUnique({
      where: { id },
      include: { client: true },
    });
    if (!agreement) return errorResponse('NOT_FOUND', 'Agreement not found');
    return successResponse(agreement as AgreementWithClient);
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to fetch agreement details', err);
  }
}

export async function createAgreement(input: CreateAgreementInput): Promise<ApiResponse<Agreement>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('agreements', 'full')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Full permission required to create agreements');
  }

  const parseResult = createAgreementSchema.safeParse(input);
  if (!parseResult.success) {
    return errorResponse('VALIDATION_ERROR', 'Invalid agreement input', parseResult.error.format());
  }

  try {
    const agreement = await db.agreement.create({
      data: {
        ...parseResult.data,
        startDate: new Date(parseResult.data.startDate),
        endDate: parseResult.data.endDate ? new Date(parseResult.data.endDate) : undefined,
        deliverables: parseResult.data.deliverables as unknown as Prisma.InputJsonValue,
        createdById: session.user.id,
      },
    });

    await createAuditLog({
      userId: session.user.id,
      action: 'CREATE',
      resource: 'Agreement',
      resourceId: agreement.id,
      newData: agreement,
    });

    return successResponse(agreement);
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to create agreement', err);
  }
}

export async function updateAgreementStatus(id: string, status: AgreementStatus): Promise<ApiResponse<Agreement>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('agreements', 'full')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Full permission required to update agreement status');
  }

  try {
    const existing = await db.agreement.findUnique({ where: { id } });
    if (!existing) return errorResponse('NOT_FOUND', 'Agreement not found');

    const updated = await db.agreement.update({
      where: { id },
      data: { status },
    });

    await createAuditLog({
      userId: session.user.id,
      action: 'UPDATE',
      resource: 'Agreement',
      resourceId: id,
      previousData: { status: existing.status },
      newData: { status },
    });

    await createNotification({
      userId: session.user.id,
      type: 'INFO',
      title: 'Agreement Status Updated',
      message: `Agreement "${existing.title}" status changed to ${status}`,
      actionUrl: `/dashboard/agreements/${id}`,
    });

    return successResponse(updated);
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to update agreement status', err);
  }
}
