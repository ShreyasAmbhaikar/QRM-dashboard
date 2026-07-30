'use server';

import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { withPermission } from '@/lib/auth/permissions';
import { createAuditLog } from '@/lib/audit';
import { createNotification } from '@/lib/notifications';
import { successResponse, errorResponse, ApiResponse } from '@/lib/api/response';
import {
  createLeadSchema,
  updateLeadSchema,
  CreateLeadInput,
  UpdateLeadInput,
  LeadFilterInput,
} from './schemas';
import { Lead, LeadStatus, Client, Prisma } from '@prisma/client';

export type LeadWithCreator = Prisma.LeadGetPayload<{
  include: { createdBy: true };
}>;

export async function calculateLeadScore(data: Partial<CreateLeadInput>): Promise<number> {
  let score = 30;

  if (data.website && data.website.trim().length > 0) score += 20;
  if (data.phone && data.phone.trim().length > 0) score += 15;
  if (data.estimatedBudget) {
    if (data.estimatedBudget >= 5000) score += 25;
    else if (data.estimatedBudget >= 2000) score += 15;
    else score += 10;
  }

  return Math.min(score, 100);
}

export async function getLeads(filters?: LeadFilterInput): Promise<ApiResponse<LeadWithCreator[]>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('leads', 'read')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Permission denied for leads module');
  }

  try {
    const where: Prisma.LeadWhereInput = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.search) {
      where.OR = [
        { companyName: { contains: filters.search, mode: 'insensitive' } },
        { contactName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters?.minScore) where.score = { gte: filters.minScore };

    const leads = await db.lead.findMany({
      where,
      include: { createdBy: true },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(leads as LeadWithCreator[]);
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to fetch leads', err);
  }
}

export async function getLeadById(id: string): Promise<ApiResponse<LeadWithCreator>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('leads', 'read')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Permission denied for leads module');
  }

  try {
    const lead = await db.lead.findUnique({
      where: { id },
      include: { createdBy: true },
    });

    if (!lead) return errorResponse('NOT_FOUND', 'Lead not found');
    return successResponse(lead as LeadWithCreator);
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to fetch lead details', err);
  }
}

export async function triggerQuickAudit(leadId: string): Promise<ApiResponse<{ status: string; reportUrl?: string }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  try {
    const lead = await db.lead.findUnique({ where: { id: leadId } });
    if (!lead) return errorResponse('NOT_FOUND', 'Lead not found');

    await db.lead.update({
      where: { id: leadId },
      data: { status: LeadStatus.AUDIT_SENT },
    });

    await createAuditLog({
      userId: session.user.id,
      action: 'UPDATE',
      resource: 'Lead',
      resourceId: leadId,
      newData: { status: LeadStatus.AUDIT_SENT },
    });

    return successResponse({
      status: 'COMPLETED',
      reportUrl: `https://reports.quantumreachmedia.com/audit-${leadId}.pdf`,
    });
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to trigger quick audit', err);
  }
}

export async function createLead(input: CreateLeadInput): Promise<ApiResponse<Lead>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('leads', 'full')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Full permission required to create leads');
  }

  const parseResult = createLeadSchema.safeParse(input);
  if (!parseResult.success) {
    return errorResponse('VALIDATION_ERROR', 'Invalid lead input', parseResult.error.format());
  }

  const data = parseResult.data;
  const score = await calculateLeadScore(data);

  try {
    const lead = await db.lead.create({
      data: {
        companyName: data.companyName,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone || null,
        website: data.website || '',
        status: data.status || LeadStatus.NEW,
        notes: data.notes || null,
        estimatedBudget: data.estimatedBudget || null,
        score,
        createdById: session.user.id,
      },
    });

    await createAuditLog({
      userId: session.user.id,
      action: 'CREATE',
      resource: 'Lead',
      resourceId: lead.id,
      newData: lead,
    });

    return successResponse(lead);
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to create lead', err);
  }
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<ApiResponse<Lead>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('leads', 'full')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Full permission required to update lead status');
  }

  try {
    const existing = await db.lead.findUnique({ where: { id } });
    if (!existing) return errorResponse('NOT_FOUND', 'Lead not found');

    const updated = await db.lead.update({
      where: { id },
      data: { status },
    });

    await createAuditLog({
      userId: session.user.id,
      action: 'UPDATE',
      resource: 'Lead',
      resourceId: id,
      previousData: { status: existing.status },
      newData: { status },
    });

    return successResponse(updated);
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to update lead status', err);
  }
}

export async function convertLeadToClient(leadId: string): Promise<ApiResponse<Client>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('clients', 'full')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Full permission required to convert lead to client');
  }

  try {
    const lead = await db.lead.findUnique({ where: { id: leadId } });
    if (!lead) return errorResponse('NOT_FOUND', 'Lead not found');

    const domain = lead.website ? lead.website.replace(/^https?:\/\//, '').replace(/\/.*$/, '') : `${lead.companyName.toLowerCase().replace(/\s+/g, '')}.com`;

    const client = await db.$transaction(async (tx) => {
      const newClient = await tx.client.create({
        data: {
          name: lead.companyName,
          domain,
          managerId: session.user.id,
        },
      });

      await tx.lead.update({
        where: { id: leadId },
        data: { status: LeadStatus.WON },
      });

      return newClient;
    });

    await createAuditLog({
      userId: session.user.id,
      action: 'CREATE',
      resource: 'Client',
      resourceId: client.id,
      newData: client,
    });

    await createNotification({
      userId: session.user.id,
      type: 'SUCCESS',
      title: 'Lead Converted to Client!',
      message: `Lead ${lead.companyName} was successfully converted into an active client.`,
      actionUrl: `/dashboard/clients/${client.id}`,
    });

    return successResponse(client);
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to convert lead to client', err);
  }
}
