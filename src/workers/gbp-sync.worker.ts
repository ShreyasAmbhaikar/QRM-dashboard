import { Worker, Job } from 'bullmq';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { GbpApiClient } from '@/lib/api/gbp';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

export interface GbpSyncJobData {
  postId: string;
}

export const gbpSyncWorker = new Worker<GbpSyncJobData>(
  'gbp-sync-queue',
  async (job: Job<GbpSyncJobData>) => {
    const { postId } = job.data;
    logger.info({ postId }, 'Processing scheduled GBP post publishing job');

    try {
      const post = await db.post.findUnique({
        where: { id: postId },
        include: { client: { include: { gbpIntegration: true } } },
      });

      if (!post || !post.client.gbpIntegration) {
        throw new Error('Post or associated GBP integration not found');
      }

      const client = new GbpApiClient(post.client.gbpIntegration.accessToken);
      const result = await client.publishLocalPost(post.client.gbpIntegration.locationId, {
        summary: post.summary,
      });

      await db.post.update({
        where: { id: postId },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
          gbpPostId: result.name || 'published-mock-id',
        },
      });

      logger.info({ postId }, 'GBP post published successfully');
    } catch (error) {
      logger.error({ error, postId }, 'Failed to publish GBP post via worker');
      await db.post.update({
        where: { id: postId },
        data: { status: 'FAILED' },
      });
      throw error;
    }
  },
  { connection }
);
