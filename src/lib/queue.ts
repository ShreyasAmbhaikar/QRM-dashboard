import { Queue } from 'bullmq';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  // Fail-fast configuration for ioredis when Redis server is offline
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  connectTimeout: 1000, // 1 second timeout
  retryStrategy(times: number) {
    if (times > 1) {
      return null; // Stop reconnecting and throw error immediately
    }
    return 50; // Retry once after 50ms
  }
};

const globalForQueue = globalThis as unknown as {
  gridScanQueue: Queue | undefined;
};

export const gridScanQueue =
  globalForQueue.gridScanQueue ??
  new Queue('grid-scan-queue', { connection });

if (process.env.NODE_ENV !== 'production') {
  globalForQueue.gridScanQueue = gridScanQueue;
}
