'use server';

import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { withPermission } from '@/lib/auth/permissions';
import { successResponse, errorResponse, ApiResponse } from '@/lib/api/response';
import { AuditLog } from '@prisma/client';

export async function getAuditLogs(page = 1, limit = 50): Promise<ApiResponse<{ logs: AuditLog[]; total: number }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('activityLog', 'read')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Permission denied for audit log module');
  }

  try {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.auditLog.count(),
    ]);

    return successResponse({ logs, total });
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to fetch audit log', err);
  }
}
