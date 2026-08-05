import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function getActiveClientId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const clientId = cookieStore.get('gbp_active_client')?.value;

    if (clientId) {
      // Verify client exists and has a connected GBP integration
      const exists = await db.gbpIntegration.findUnique({
        where: { clientId },
      });
      if (exists) return clientId;
    }

    // Fallback to the first connected client profile in the database
    const firstConnected = await db.gbpIntegration.findFirst({
      select: { clientId: true },
    });
    return firstConnected?.clientId || null;
  } catch {
    return null;
  }
}
