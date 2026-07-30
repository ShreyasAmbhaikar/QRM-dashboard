import { Worker, Job } from 'bullmq';
import { sendEmail } from '@/lib/email/client';
import { logger } from '@/lib/logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
}

export const emailWorker = new Worker<EmailJobData>(
  'email-queue',
  async (job: Job<EmailJobData>) => {
    logger.info({ jobId: job.id, to: job.data.to }, 'Processing email background job...');
    await sendEmail({
      to: job.data.to,
      subject: job.data.subject,
      html: job.data.html,
    });
  },
  {
    connection: {
      url: redisUrl,
    },
    concurrency: 5,
  }
);

emailWorker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Email background job completed successfully');
});

emailWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, error: err }, 'Email background job failed');
});
