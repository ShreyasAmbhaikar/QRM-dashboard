import { db } from '@/lib/db';

export interface CreateNotificationOptions {
  userId: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  actionUrl?: string;
}

export async function createNotification(options: CreateNotificationOptions) {
  try {
    return await db.notification.create({
      data: {
        userId: options.userId,
        type: options.type,
        title: options.title,
        message: options.message,
        metadata: options.metadata ? (options.metadata as object) : undefined,
        actionUrl: options.actionUrl,
      },
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
}
