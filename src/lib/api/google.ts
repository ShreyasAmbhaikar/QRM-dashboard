import { google } from 'googleapis';
import { encrypt, decrypt } from '@/lib/crypto';
import { logger } from '@/lib/logger';

export function getGoogleOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID || 'mock-google-client-id';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || 'mock-google-client-secret';
  const redirectUri = process.env.NEXTAUTH_URL
    ? `${process.env.NEXTAUTH_URL}/api/integrations/google/callback`
    : 'http://localhost:3000/api/integrations/google/callback';

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getGoogleAuthUrl(state: string) {
  const oauth2Client = getGoogleOAuthClient();
  const scopes = [
    'https://www.googleapis.com/auth/business.manage',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
    state,
  });
}

export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = getGoogleOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export async function refreshAccessToken(encryptedRefreshToken: string) {
  try {
    const refreshToken = decrypt(encryptedRefreshToken);
    const oauth2Client = getGoogleOAuthClient();
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const { credentials } = await oauth2Client.refreshAccessToken();
    return {
      accessToken: credentials.access_token ? encrypt(credentials.access_token) : null,
      expiryDate: credentials.expiry_date ? new Date(credentials.expiry_date) : new Date(Date.now() + 3600 * 1000),
    };
  } catch (error) {
    logger.error({ error }, 'Failed to refresh Google access token');
    throw error;
  }
}
