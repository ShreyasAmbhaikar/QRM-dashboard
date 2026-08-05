import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { exchangeCodeForTokens } from '@/lib/api/google';
import { encrypt } from '@/lib/crypto';
import { createAuditLog } from '@/lib/audit';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');

  if (!code || !stateParam) {
    return NextResponse.redirect(new URL('/gbp?error=MissingCode', request.url));
  }

  try {
    const decodedState = Buffer.from(stateParam, 'base64').toString('utf-8');
    const { userId, clientId } = JSON.parse(decodedState);
    const tokens = await exchangeCodeForTokens(code);

    if (!tokens.access_token) {
      throw new Error('Failed to obtain access token from Google');
    }

    const encryptedAccessToken = encrypt(tokens.access_token);
    const encryptedRefreshToken = tokens.refresh_token ? encrypt(tokens.refresh_token) : encryptedAccessToken;
    const expiryDate = tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600 * 1000);

    if (clientId === 'import') {
      const pending = await db.pendingGoogleConnection.create({
        data: {
          userId,
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          expiryDate,
        },
      });

      await createAuditLog({
        userId,
        action: 'CREATE',
        resource: 'PendingGoogleConnection',
        resourceId: pending.id,
        newData: { status: 'PENDING_SELECTION' },
      });

      return NextResponse.redirect(new URL(`/dashboard/gbp/import?connectionId=${pending.id}`, request.url));
    }

    await db.gbpIntegration.upsert({
      where: { clientId },
      create: {
        clientId,
        locationId: 'locations/primary',
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiryDate,
      },
      update: {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiryDate,
        lastSyncedAt: new Date(),
      },
    });

    await createAuditLog({
      userId,
      action: 'UPDATE',
      resource: 'GbpIntegration',
      resourceId: clientId,
      newData: { status: 'CONNECTED' },
    });

    return NextResponse.redirect(new URL('/gbp?status=Connected', request.url));
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(new URL('/gbp?error=OAuthFailed', request.url));
  }
}
