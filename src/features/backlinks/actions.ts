'use server';

import { AddBacklinkSchema, AddBacklinkInput } from './schemas';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { withPermission } from '@/lib/auth/permissions';
import { createAuditLog } from '@/lib/audit';
import { successResponse, errorResponse, ApiResponse } from '@/lib/api/response';

export async function addBacklink(rawInput: AddBacklinkInput): Promise<ApiResponse<any>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('backlinks', 'full')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Permission denied');
  }

  try {
    const validated = AddBacklinkSchema.parse(rawInput);
    const backlink = await db.backlink.create({
      data: validated,
    });

    await createAuditLog({
      userId: session.user.id,
      action: 'CREATE',
      resource: 'BACKLINK',
      resourceId: backlink.id,
      newData: validated,
    });

    return successResponse(backlink);
  } catch (error: any) {
    return errorResponse('BACKLINK_ADD_FAILED', error.message || 'Failed to add backlink');
  }
}

export async function updateCitationStatus(id: string, status: string, nameMatch: boolean, addressMatch: boolean, phoneMatch: boolean): Promise<ApiResponse<any>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('backlinks', 'full')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Permission denied');
  }

  try {
    const updated = await db.citationListing.update({
      where: { id },
      data: {
        status,
        nameMatch,
        addressMatch,
        phoneMatch,
        lastCheckedAt: new Date(),
      },
    });

    await createAuditLog({
      userId: session.user.id,
      action: 'UPDATE',
      resource: 'CITATION_LISTING',
      resourceId: updated.id,
      newData: { status, nameMatch, addressMatch, phoneMatch },
    });

    return successResponse(updated);
  } catch (error: any) {
    return errorResponse('CITATION_UPDATE_FAILED', error.message || 'Failed to update citation status');
  }
}
