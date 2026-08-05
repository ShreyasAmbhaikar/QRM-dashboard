import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getGoogleAuthUrl } from '@/lib/api/google';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId') || 'default-client';

  const state = Buffer.from(JSON.stringify({ userId: session.user.id, clientId })).toString('base64');
  const authUrl = getGoogleAuthUrl(state);

  return NextResponse.redirect(authUrl);
}
