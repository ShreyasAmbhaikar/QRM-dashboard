'use server';

import { UpdateProfileSchema, UpdateRbacSchema } from './schemas';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { withPermission } from '@/lib/auth/permissions';
import { createAuditLog } from '@/lib/audit';
import { successResponse, errorResponse, ApiResponse } from '@/lib/api/response';

export async function updateUserPermissions(targetUserId: string, customPermissions: Record<string, string>): Promise<ApiResponse<any>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('settings', 'full')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Permission denied');
  }

  try {
    const updated = await db.userPermission.upsert({
      where: { userId: targetUserId },
      create: {
        userId: targetUserId,
        customPermissions: JSON.stringify(customPermissions),
        isCustomized: true,
        updatedBy: session.user.id,
      },
      update: {
        customPermissions: JSON.stringify(customPermissions),
        isCustomized: true,
        updatedBy: session.user.id,
      },
    });

    await createAuditLog({
      userId: session.user.id,
      action: 'UPDATE',
      resource: 'USER_PERMISSION',
      resourceId: targetUserId,
      newData: customPermissions,
    });

    return successResponse(updated);
  } catch (error: any) {
    return errorResponse('RBAC_UPDATE_FAILED', error.message || 'Failed to update user RBAC matrix');
  }
}
