import React from 'react';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { GbpConnectButton } from '@/features/gbp/components/gbp-connect-button';
import { GbpScoreBreakdown } from '@/features/gbp/components/gbp-score-breakdown';
import { ReviewFeed } from '@/features/gbp/components/review-feed';
import { GbpClientSwitcher } from '@/features/gbp/components/gbp-client-switcher';
import { Building2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface GbpClientPageProps {
  params: Promise<{ clientId: string }>;
}

export default async function GbpClientPage({ params }: GbpClientPageProps) {
  const { clientId } = await params;

  let client: any = null;
  let connectedClients: any[] = [];
  try {
    client = await db.client.findUnique({
      where: { id: clientId },
      include: {
        gbpIntegration: true,
        gbpReviews: true,
      },
    });

    connectedClients = await db.client.findMany({
      where: {
        gbpIntegration: { isNot: null },
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    });
  } catch (e) {
    client = null;
  }

  if (!client) {
    notFound();
  }

  const mockProfileData = {
    name: client.name,
    primaryCategory: 'SEO Agency',
    additionalCategories: ['Digital Marketing', 'Advertising'],
    address: '100 Marketing Blvd, Suite 200',
    phone: '(555) 100-2000',
    hoursSet: true,
    websiteUrl: client.websiteUrl || 'https://example.com',
    description: 'Premier local SEO agency helping businesses dominate Google search maps.',
    attributesFilled: true,
    photoCount: 8,
    postCount: 4,
    reviewResponseRate: 75,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/gbp">
            <div className="p-2 rounded-lg border border-border hover:bg-card">
              <ArrowLeft className="h-4 w-4" />
            </div>
          </Link>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" /> {client.name} — Business Profile
            </h1>
            <p className="text-xs text-muted-foreground">GBP Location Audit & AI Review Response Inbox</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <GbpClientSwitcher currentClientId={client.id} clients={connectedClients} />
          <GbpConnectButton clientId={client.id} isConnected={!!client.gbpIntegration} />
        </div>
      </div>

      <GbpScoreBreakdown profile={mockProfileData} />

      <ReviewFeed reviews={client.gbpReviews} />
    </div>
  );
}
