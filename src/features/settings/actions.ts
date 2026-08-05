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

export async function updateUserProfile(data: { name: string; email: string; image?: string }): Promise<ApiResponse<any>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  // RBAC check: Verify the user has at least read access to the dashboard
  const hasPermission = await withPermission('dashboard', 'read')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Permission denied');
  }

  // Zod validation
  const result = UpdateProfileSchema.safeParse(data);
  if (!result.success) {
    return errorResponse('VALIDATION_ERROR', 'Invalid input data', result.error.flatten().fieldErrors);
  }

  try {
    const updated = await db.user.update({
      where: { id: session.user.id },
      data: {
        name: result.data.name,
        email: result.data.email,
        image: result.data.image,
      },
    });

    await createAuditLog({
      userId: session.user.id,
      action: 'UPDATE',
      resource: 'USER_PROFILE',
      resourceId: session.user.id,
      newData: { name: result.data.name, email: result.data.email, image: result.data.image },
    });

    return successResponse({
      name: updated.name,
      email: updated.email,
      image: updated.image,
    });
  } catch (error: any) {
    return errorResponse('PROFILE_UPDATE_FAILED', error.message || 'Failed to update user profile');
  }
}

