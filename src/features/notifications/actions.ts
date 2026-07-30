'use server';

import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse, ApiResponse } from '@/lib/api/response';
import { Notification } from '@prisma/client';

export async function getNotifications(): Promise<ApiResponse<Notification[]>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  try {
    const notifications = await db.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return successResponse(notifications);
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to fetch notifications', err);
  }
}

export async function markAsRead(notificationId: string): Promise<ApiResponse<{ updated: boolean }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  try {
    await db.notification.update({
      where: { id: notificationId, userId: session.user.id },
      data: { isRead: true, readAt: new Date() },
    });

    return successResponse({ updated: true });
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to mark notification as read', err);
  }
}

export async function markAllAsRead(): Promise<ApiResponse<{ count: number }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  try {
    const result = await db.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return successResponse({ count: result.count });
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to mark all as read', err);
  }
}
