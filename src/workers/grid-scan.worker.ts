import { Worker, Job } from 'bullmq';
import { logger } from '@/lib/logger';
import { runLocalGridScan, ScanInput } from '@/features/local-grid/scan-processor';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

export const gridScanWorker = new Worker<ScanInput>(
  'grid-scan-queue',
  async (job: Job<ScanInput>) => {
    logger.info({ jobId: job.id }, 'Executing background worker local grid scan job');
    try {
      const gridIds = await runLocalGridScan(job.data, async (progress) => {
        await job.updateProgress(progress);
      });
      return { success: true, gridIds };
    } catch (err: any) {
      logger.error({ err, jobId: job.id }, 'Background grid scan worker failed');
      throw err;
    }
  },
  { connection }
);
