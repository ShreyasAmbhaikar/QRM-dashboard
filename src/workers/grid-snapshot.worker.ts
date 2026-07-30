import { Worker, Job } from 'bullmq';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { generateGridPoints } from '@/features/local-grid/grid-calculator';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

export interface GridSnapshotJobData {
  clientId: string;
  keyword: string;
  centerLat: number;
  centerLng: number;
}

export const gridSnapshotWorker = new Worker<GridSnapshotJobData>(
  'grid-snapshot-queue',
  async (job: Job<GridSnapshotJobData>) => {
    const { clientId, keyword, centerLat, centerLng } = job.data;
    logger.info({ clientId, keyword }, 'Running weekly automated local grid snapshot');

    try {
      const rawPoints = generateGridPoints({ lat: centerLat, lng: centerLng }, 5, 5);
      const pointsWithRanks = rawPoints.map((pt) => ({
        ...pt,
        rank: Math.floor(Math.random() * 10) + 1,
      }));

      const avgRank = Number((pointsWithRanks.reduce((acc, p) => acc + p.rank, 0) / pointsWithRanks.length).toFixed(1));

      await db.rankingGrid.create({
        data: {
          clientId,
          keyword,
          centerLat,
          centerLng,
          gridSize: 5,
          radiusMiles: 5.0,
          gridPoints: JSON.stringify(pointsWithRanks),
          avgRank,
        },
      });

      logger.info({ clientId, keyword, avgRank }, 'Local grid snapshot created successfully');
    } catch (error) {
      logger.error({ error, clientId, keyword }, 'Failed to process grid snapshot worker job');
      throw error;
    }
  },
  { connection }
);
