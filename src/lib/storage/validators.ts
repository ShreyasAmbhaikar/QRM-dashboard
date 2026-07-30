import { z } from 'zod';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from './constants';

export const fileUploadSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().refine((val) => ALLOWED_MIME_TYPES.includes(val as any), {
    message: 'Unsupported file type. Allowed types: JPEG, PNG, WEBP, GIF, PDF, CSV',
  }),
  fileSize: z.number().max(MAX_FILE_SIZE_BYTES, 'File size exceeds maximum allowed 10MB limit'),
});

export type FileUploadInput = z.infer<typeof fileUploadSchema>;
