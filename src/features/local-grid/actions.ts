'use server';

import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { withPermission } from '@/lib/auth/permissions';
import { createAuditLog } from '@/lib/audit';
import { successResponse, errorResponse, ApiResponse } from '@/lib/api/response';
import { generateGridSchema, GenerateGridInput } from './schemas';
import { generateGridPoints, GridPoint } from './grid-calculator';
import { RankingGrid } from '@prisma/client';

export async function generateLocalRankingGrid(input: GenerateGridInput): Promise<ApiResponse<{ grid: RankingGrid; points: GridPoint[] }>> {
  const session = await auth();
  if (!session?.user?.id) return errorResponse('UNAUTHORIZED', 'Auth required');

  const hasPermission = await withPermission('localGrid', 'read')(session.user.id);
  if (!hasPermission) return errorResponse('FORBIDDEN', 'Permission denied');

  const parseResult = generateGridSchema.safeParse(input);
  if (!parseResult.success) return errorResponse('VALIDATION_ERROR', 'Invalid grid input', parseResult.error.format());

  const { clientId, keyword, centerLat, centerLng, gridSize, radiusMiles } = parseResult.data;

  try {
    const rawPoints = generateGridPoints({ lat: centerLat, lng: centerLng }, gridSize as 3 | 5 | 7, radiusMiles);

    const pointsWithRanks: GridPoint[] = rawPoints.map((pt) => {
      const distFromCenter = Math.sqrt(Math.pow(pt.row - Math.floor(gridSize / 2), 2) + Math.pow(pt.col - Math.floor(gridSize / 2), 2));
      const simulatedRank = Math.min(20, Math.max(1, Math.round(distFromCenter * 2.5 + 1 + Math.random() * 2)));
      return { ...pt, rank: simulatedRank };
    });

    const sumRanks = pointsWithRanks.reduce((acc, p) => acc + (p.rank || 20), 0);
    const avgRank = Number((sumRanks / pointsWithRanks.length).toFixed(1));

    const grid = await db.rankingGrid.create({
      data: {
        clientId,
        keyword,
        centerLat,
        centerLng,
        gridSize,
        radiusMiles,
        gridPoints: JSON.stringify(pointsWithRanks),
        avgRank,
      },
    });

    await createAuditLog({
      userId: session.user.id,
      action: 'CREATE',
      resource: 'RankingGrid',
      resourceId: grid.id,
      newData: { keyword, gridSize, radiusMiles },
    });

    return successResponse({ grid, points: pointsWithRanks });
  } catch (err: unknown) {
    return errorResponse('DATABASE_ERROR', 'Failed to generate local grid', err);
  }
}
