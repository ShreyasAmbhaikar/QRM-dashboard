'use server';

import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { withPermission } from '@/lib/auth/permissions';
import { createAuditLog } from '@/lib/audit';
import { successResponse, errorResponse, ApiResponse } from '@/lib/api/response';
import { createTaskSchema, updateTaskSchema, CreateTaskInput, UpdateTaskInput } from './schemas';
import { Task, Prisma } from '@prisma/client';

export type TaskWithRelations = Prisma.TaskGetPayload<{
  include: {
    client: true;
    assignee: true;
  };
}>;

export async function getTasks(clientId?: string): Promise<ApiResponse<TaskWithRelations[]>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('tasks', 'read')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Permission denied for tasks module');
  }

  try {
    const tasks = await db.task.findMany({
      where: clientId ? { clientId } : undefined,
      include: {
        client: true,
        assignee: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(tasks as TaskWithRelations[]);
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to fetch tasks', err);
  }
}

export async function createTask(input: CreateTaskInput): Promise<ApiResponse<Task>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('tasks', 'full')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Full permission required to create tasks');
  }

  const parseResult = createTaskSchema.safeParse(input);
  if (!parseResult.success) {
    return errorResponse('VALIDATION_ERROR', 'Invalid task input', parseResult.error.format());
  }

  try {
    const task = await db.task.create({
      data: {
        ...parseResult.data,
        dueDate: parseResult.data.dueDate ? new Date(parseResult.data.dueDate) : undefined,
        assigneeId: parseResult.data.assigneeId || session.user.id,
      },
    });

    await createAuditLog({
      userId: session.user.id,
      action: 'CREATE',
      resource: 'Task',
      resourceId: task.id,
      newData: task,
    });

    return successResponse(task);
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to create task', err);
  }
}

export async function updateTaskStatus(id: string, status: string): Promise<ApiResponse<Task>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('tasks', 'full')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Full permission required to update tasks');
  }

  try {
    const existing = await db.task.findUnique({ where: { id } });
    if (!existing) return errorResponse('NOT_FOUND', 'Task not found');

    const updated = await db.task.update({
      where: { id },
      data: { status },
    });

    await createAuditLog({
      userId: session.user.id,
      action: 'UPDATE',
      resource: 'Task',
      resourceId: id,
      previousData: { status: existing.status },
      newData: { status },
    });

    return successResponse(updated);
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to update task status', err);
  }
}
