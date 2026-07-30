'use server';

import { TriggerAuditSchema, TriggerAuditInput } from './schemas';
import { runSeoAuditCrawl } from '@/workers/crawler';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { withPermission } from '@/lib/auth/permissions';
import { createAuditLog } from '@/lib/audit';
import { successResponse, errorResponse, ApiResponse } from '@/lib/api/response';

export async function triggerSeoAudit(rawInput: TriggerAuditInput): Promise<ApiResponse<any>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('seoAudit', 'full')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Permission denied');
  }

  try {
    const validated = TriggerAuditSchema.parse(rawInput);
    const crawlResult = await runSeoAuditCrawl(validated.domainUrl);

    const mockCwv = {
      lcp: '1.8s',
      cls: '0.04',
      inp: '110ms',
      performanceScore: 92,
    };

    const audit = await db.seoAudit.create({
      data: {
        clientId: validated.clientId,
        healthScore: crawlResult.healthScore,
        pagesCrawled: crawlResult.pagesCrawled,
        issuesFound: JSON.stringify(crawlResult.issues),
        coreWebVitals: JSON.stringify(mockCwv),
      },
    });

    await createAuditLog({
      userId: session.user.id,
      action: 'CREATE',
      resource: 'SEO_AUDIT',
      resourceId: audit.id,
      newData: { clientId: validated.clientId, healthScore: crawlResult.healthScore },
    });

    return successResponse(audit);
  } catch (error: any) {
    return errorResponse('AUDIT_TRIGGER_FAILED', error.message || 'Failed to trigger SEO audit');
  }
}

export async function getSeoAuditById(id: string): Promise<ApiResponse<any>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('seoAudit', 'read')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Permission denied');
  }

  try {
    const audit = await db.seoAudit.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!audit) {
      return errorResponse('AUDIT_NOT_FOUND', 'SEO audit not found');
    }

    return successResponse(audit);
  } catch (error: any) {
    return errorResponse('AUDIT_FETCH_FAILED', error.message || 'Failed to fetch SEO audit');
  }
}
