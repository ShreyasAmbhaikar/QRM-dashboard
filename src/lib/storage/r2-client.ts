import { S3Client } from '@aws-sdk/client-s3';

const accountId = process.env.R2_ACCOUNT_ID || 'mock-account-id';
const accessKeyId = process.env.R2_ACCESS_KEY_ID || 'mock-access-key';
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || 'mock-secret-key';

export const r2BucketName = process.env.R2_BUCKET_NAME || 'qrm-dashboard-assets';

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});
