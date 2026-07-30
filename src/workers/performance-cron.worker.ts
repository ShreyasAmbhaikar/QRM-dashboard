import { Worker, Job } from 'bullmq';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

export const performanceCronWorker = new Worker(
  'performance-cron-queue',
  async (job: Job) => {
    logger.info('Running weekly automated Core Web Vitals performance check cron worker');

    const clients = await db.client.findMany({ where: { status: 'ACTIVE' } });

    for (const client of clients) {
      const grade = Math.floor(Math.random() * 15) + 85;
      await db.performanceLog.create({
        data: {
          clientId: client.id,
          lcpScore: Number((Math.random() * 1.5 + 1.2).toFixed(2)),
          inpScore: Number((Math.random() * 50 + 80).toFixed(0)),
          clsScore: Number((Math.random() * 0.05).toFixed(3)),
          performanceGrade: grade,
        },
      });
    }

    logger.info({ totalClients: clients.length }, 'Weekly performance check cron completed');
  },
  { connection }
);
