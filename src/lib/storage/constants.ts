export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/csv',
] as const;

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

export const R2_PATH_PREFIXES = {
  CLIENT_LOGOS: 'logos',
  AGREEMENTS: 'agreements',
  GBP_POSTS: 'gbp-posts',
  AUDIT_REPORTS: 'audits',
} as const;
