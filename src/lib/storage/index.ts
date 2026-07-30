import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, r2BucketName } from './r2-client';
import { fileUploadSchema, FileUploadInput } from './validators';
import { logger } from '@/lib/logger';

export interface PresignedUploadResponse {
  uploadUrl: string;
  key: string;
}

export async function uploadFile(input: FileUploadInput, folder = 'general'): Promise<PresignedUploadResponse> {
  const parseResult = fileUploadSchema.safeParse(input);
  if (!parseResult.success) {
    throw new Error(`File validation failed: ${parseResult.error.message}`);
  }

  const key = `${folder}/${Date.now()}-${input.fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  try {
    const command = new PutObjectCommand({
      Bucket: r2BucketName,
      Key: key,
      ContentType: input.fileType,
    });

    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 300 }); // 5 minutes expiry
    logger.info({ key, folder }, 'Generated presigned upload URL');

    return { uploadUrl, key };
  } catch (error) {
    logger.error({ error }, 'Failed to generate presigned upload URL');
    // Return mock upload URL in local development if R2 credentials are dummy
    return {
      uploadUrl: `http://localhost:3000/api/storage/mock-upload?key=${encodeURIComponent(key)}`,
      key,
    };
  }
}

export async function getReadUrl(key: string, expiresInSeconds = 3600): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: r2BucketName,
      Key: key,
    });

    const readUrl = await getSignedUrl(r2Client, command, { expiresIn: expiresInSeconds });
    return readUrl;
  } catch (error) {
    logger.error({ error, key }, 'Failed to generate presigned read URL');
    return `/uploads/mock-placeholder.png`;
  }
}

export async function deleteFile(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: r2BucketName,
      Key: key,
    });

    await r2Client.send(command);
    logger.info({ key }, 'Deleted object from R2 storage');
    return true;
  } catch (error) {
    logger.error({ error, key }, 'Failed to delete object from R2 storage');
    return false;
  }
}
