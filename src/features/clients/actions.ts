'use server';

import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { withPermission } from '@/lib/auth/permissions';
import { createAuditLog } from '@/lib/audit';
import { successResponse, errorResponse, ApiResponse } from '@/lib/api/response';
import { createClientSchema, updateClientSchema, CreateClientInput, UpdateClientInput } from './schemas';
import { Prisma } from '@prisma/client';

export type ClientWithRelations = Prisma.ClientGetPayload<{
  include: {
    manager: { select: { id: true; name: true; email: true } };
    keywords: true;
    competitors: true;
    gbpIntegration: true;
    tasks: true;
    _count: {
      select: {
        keywords: true;
        competitors: true;
        posts: true;
        tasks: true;
      };
    };
  };
}>;

export async function getClients(): Promise<ApiResponse<ClientWithRelations[]>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('clients', 'read')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Permission denied for clients module');
  }

  try {
    const clients = await db.client.findMany({
      include: {
        manager: { select: { id: true, name: true, email: true } },
        keywords: true,
        competitors: true,
        gbpIntegration: true,
        tasks: true,
        _count: {
          select: {
            keywords: true,
            competitors: true,
            posts: true,
            tasks: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return successResponse(clients as unknown as ClientWithRelations[]);
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to fetch clients', err);
  }
}

export async function getClientById(id: string): Promise<ApiResponse<ClientWithRelations>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('clients', 'read')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Permission denied for clients module');
  }

  try {
    const client = await db.client.findUnique({
      where: { id },
      include: {
        manager: { select: { id: true, name: true, email: true } },
        keywords: { orderBy: { currentRank: 'asc' }, take: 10 },
        competitors: true,
        gbpIntegration: true,
        tasks: { where: { status: { not: 'DONE' } } },
        _count: {
          select: {
            keywords: true,
            competitors: true,
            posts: true,
            tasks: true,
          },
        },
      },
    });

    if (!client) {
      return errorResponse('NOT_FOUND', 'Client not found');
    }

    return successResponse(client as unknown as ClientWithRelations);
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to fetch client details', err);
  }
}

export async function createClient(input: CreateClientInput): Promise<ApiResponse<ClientWithRelations>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('clients', 'full')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Full permission required to create clients');
  }

  const parseResult = createClientSchema.safeParse(input);
  if (!parseResult.success) {
    return errorResponse('VALIDATION_ERROR', 'Invalid client input', parseResult.error.format());
  }

  try {
    const newClient = await db.client.create({
      data: parseResult.data,
      include: {
        manager: { select: { id: true, name: true, email: true } },
        keywords: true,
        competitors: true,
        gbpIntegration: true,
        tasks: true,
        _count: {
          select: {
            keywords: true,
            competitors: true,
            posts: true,
            tasks: true,
          },
        },
      },
    });

    await createAuditLog({
      userId: session.user.id,
      action: 'CREATE',
      resource: 'Client',
      resourceId: newClient.id,
      newData: newClient,
    });

    return successResponse(newClient as unknown as ClientWithRelations);
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to create client', err);
  }
}

export async function updateClient(input: UpdateClientInput): Promise<ApiResponse<ClientWithRelations>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('clients', 'full')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Full permission required to update clients');
  }

  const parseResult = updateClientSchema.safeParse(input);
  if (!parseResult.success) {
    return errorResponse('VALIDATION_ERROR', 'Invalid update input', parseResult.error.format());
  }

  try {
    const existing = await db.client.findUnique({ where: { id: input.id } });
    if (!existing) {
      return errorResponse('NOT_FOUND', 'Client not found');
    }

    const updated = await db.client.update({
      where: { id: input.id },
      data: parseResult.data,
      include: {
        manager: { select: { id: true, name: true, email: true } },
        keywords: true,
        competitors: true,
        gbpIntegration: true,
        tasks: true,
        _count: {
          select: {
            keywords: true,
            competitors: true,
            posts: true,
            tasks: true,
          },
        },
      },
    });

    await createAuditLog({
      userId: session.user.id,
      action: 'UPDATE',
      resource: 'Client',
      resourceId: updated.id,
      previousData: existing,
      newData: updated,
    });

    return successResponse(updated as unknown as ClientWithRelations);
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to update client', err);
  }
}

export async function deleteClient(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('clients', 'full')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Full permission required to delete clients');
  }

  try {
    const existing = await db.client.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('NOT_FOUND', 'Client not found');
    }

    await db.client.delete({ where: { id } });

    await createAuditLog({
      userId: session.user.id,
      action: 'DELETE',
      resource: 'Client',
      resourceId: id,
      previousData: existing,
    });

    return successResponse({ deleted: true });
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to delete client', err);
  }
}
