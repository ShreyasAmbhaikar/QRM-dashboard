'use server';

import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { withPermission } from '@/lib/auth/permissions';
import { createAuditLog } from '@/lib/audit';
import { successResponse, errorResponse, ApiResponse } from '@/lib/api/response';
import { generateGridSchema, GenerateGridInput } from './schemas';
import { gridScanQueue } from '@/lib/queue';
import { runLocalGridScan } from './scan-processor';
import { RankingGrid } from '@prisma/client';

// Dynamic import to auto-boot background workers during Next.js local development
if (process.env.NODE_ENV === 'development') {
  import('@/workers/grid-scan.worker')
    .then(() => {
      console.log('⚡ QRM local grid scan background worker booted successfully.');
    })
    .catch((err) => {
      console.error('❌ Failed to boot local grid scan background worker:', err);
    });
}

// 1. Enqueue or Direct Run Local Geo-Grid Scan
export async function enqueueLocalGridScan(
  input: GenerateGridInput
): Promise<ApiResponse<{ jobId?: string; gridIds?: string[] }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('localGrid', 'full')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Full permissions required to run ranking scans');
  }

  const parseResult = generateGridSchema.safeParse(input);
  if (!parseResult.success) {
    return errorResponse('VALIDATION_ERROR', 'Invalid grid input', parseResult.error.format());
  }

  const data = parseResult.data;

  try {
    // A. Direct Synchronous Mode: If playwright is disabled, run the simulator synchronously (takes <1s)
    if (process.env.ENABLE_PLAYWRIGHT_SCRAPING !== 'true') {
      const gridIds = await runLocalGridScan({
        clientId: data.clientId,
        keywords: data.keywords,
        address: data.address,
        centerLat: data.centerLat,
        centerLng: data.centerLng,
        gridSize: data.gridSize,
        radiusMiles: data.radiusMiles,
        geocoder: data.geocoder,
        isCustomSearch: data.isCustomSearch,
        targetPlaceId: data.targetPlaceId,
        targetName: data.targetName,
        targetDomain: data.targetDomain,
      });

      await createAuditLog({
        userId: session.user.id,
        action: 'CREATE',
        resource: 'RankingGrid',
        newData: { 
          keywordsCount: data.keywords.length, 
          gridSize: data.gridSize, 
          radiusMiles: data.radiusMiles, 
          geocoder: data.geocoder,
          mode: 'synchronous'
        },
      });

      return successResponse({ gridIds });
    }

    // B. Queue Mode: Try scheduling background job in BullMQ
    try {
      const job = await gridScanQueue.add(
        'run-grid-scan',
        {
          clientId: data.clientId,
          keywords: data.keywords,
          address: data.address,
          centerLat: data.centerLat,
          centerLng: data.centerLng,
          gridSize: data.gridSize,
          radiusMiles: data.radiusMiles,
          geocoder: data.geocoder,
          isCustomSearch: data.isCustomSearch,
          targetPlaceId: data.targetPlaceId,
          targetName: data.targetName,
          targetDomain: data.targetDomain,
        },
        {
          removeOnComplete: true,
          removeOnFail: false,
        }
      );

      await createAuditLog({
        userId: session.user.id,
        action: 'CREATE',
        resource: 'RankingGrid',
        newData: { 
          keywordsCount: data.keywords.length, 
          gridSize: data.gridSize, 
          radiusMiles: data.radiusMiles, 
          geocoder: data.geocoder,
          mode: 'queued'
        },
      });

      return successResponse({ jobId: job.id! });
    } catch (queueErr) {
      console.warn('Queue submission failed (Redis offline). Falling back to synchronous scan execution:', queueErr);
      
      // Secondary Fallback: Execute synchronously if Redis is offline
      const gridIds = await runLocalGridScan({
        clientId: data.clientId,
        keywords: data.keywords,
        address: data.address,
        centerLat: data.centerLat,
        centerLng: data.centerLng,
        gridSize: data.gridSize,
        radiusMiles: data.radiusMiles,
        geocoder: data.geocoder,
        isCustomSearch: data.isCustomSearch,
        targetPlaceId: data.targetPlaceId,
        targetName: data.targetName,
        targetDomain: data.targetDomain,
      });

      return successResponse({ gridIds });
    }
  } catch (err: unknown) {
    console.error('Failed to execute local grid scan:', err);
    return errorResponse('DATABASE_ERROR', 'Failed to execute local rank scan', err);
  }
}

// 2. Check Job Status in Queue
export async function getGridScanStatus(
  jobId: string
): Promise<ApiResponse<{ 
  status: 'active' | 'waiting' | 'completed' | 'failed' | 'unknown'; 
  progress: number; 
  result?: { success: boolean; gridIds: string[] }; 
  error?: string;
}>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  try {
    const job = await gridScanQueue.getJob(jobId);
    if (!job) {
      return successResponse({ status: 'unknown', progress: 0 });
    }

    const state = await job.getState();
    const progress = job.progress;
    const result = job.returnvalue;
    const failedReason = job.failedReason;

    return successResponse({
      status: state as any,
      progress: typeof progress === 'number' ? progress : 0,
      result: state === 'completed' ? result : undefined,
      error: state === 'failed' ? failedReason : undefined,
    });
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to retrieve scan job status', err);
  }
}

// 3. Fetch Completed Grids in Bulk
export async function getCompletedGrids(
  gridIds: string[]
): Promise<ApiResponse<RankingGrid[]>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  try {
    const records = await db.rankingGrid.findMany({
      where: { id: { in: gridIds } },
      orderBy: { keyword: 'asc' },
    });
    return successResponse(records);
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to fetch completed ranking grids', err);
  }
}

// 4. Retrieve Scan History for Client
export async function getGridScanHistory(
  clientId: string
): Promise<ApiResponse<RankingGrid[]>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  try {
    const history = await db.rankingGrid.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(history);
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to fetch ranking grid history', err);
  }
}

// 5. Delete Grid Snapshot
export async function deleteGridScan(
  gridId: string
): Promise<ApiResponse<{ success: boolean }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', 'Authentication required');
  }

  const hasPermission = await withPermission('localGrid', 'full')(session.user.id);
  if (!hasPermission) {
    return errorResponse('FORBIDDEN', 'Full permissions required to delete history');
  }

  try {
    await db.rankingGrid.delete({
      where: { id: gridId },
    });

    await createAuditLog({
      userId: session.user.id,
      action: 'DELETE',
      resource: 'RankingGrid',
      resourceId: gridId,
    });

    return successResponse({ success: true });
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to delete ranking grid snapshot', err);
  }
}
