import { db } from '@/lib/db';

export interface AuditLogOptions {
  userId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'LOGIN' | 'SYSTEM_INITIALIZATION';
  resource: string;
  resourceId?: string;
  previousData?: unknown;
  newData?: unknown;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(options: AuditLogOptions) {
  try {
    return await db.auditLog.create({
      data: {
        userId: options.userId,
        action: options.action,
        resource: options.resource,
        resourceId: options.resourceId,
        previousData: options.previousData ? (options.previousData as object) : undefined,
        newData: options.newData ? (options.newData as object) : undefined,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log entry:', error);
    // Non-blocking error logging
    return null;
  }
}
