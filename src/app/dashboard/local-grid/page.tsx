import React from 'react';
import { db } from '@/lib/db';
import { getActiveClientId } from '@/features/gbp/active-client';
import { LocalGridManager } from '@/features/local-grid/components/local-grid-manager';

export const dynamic = 'force-dynamic';

export default async function LocalGridOverviewPage() {
  let activeClientId = await getActiveClientId();

  // If no active client listing is selected, default to the first one in the database
  if (!activeClientId) {
    const firstClient = await db.client.findFirst({
      include: { gbpIntegration: true },
    });
    if (firstClient) {
      activeClientId = firstClient.id;
    } else {
      // Auto-create a default workspace client listing if none exist
      const defaultClient = await db.client.create({
        data: {
          name: 'QRM Workspace Listing',
          domain: 'quantumreachmedia.com',
        },
      });
      activeClientId = defaultClient.id;
    }
  }

  const client = await db.client.findUnique({
    where: { id: activeClientId },
    include: { gbpIntegration: true },
  });

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] border border-dashed border-border rounded-xl p-8 bg-card text-center select-none">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Client Configuration Error</h2>
        <p className="text-xs text-muted-foreground max-w-sm mt-1.5 leading-relaxed">
          The selected client could not be loaded from database records.
        </p>
      </div>
    );
  }

  // Retrieve historical grid snapshots
  const history = await db.rankingGrid.findMany({
    where: { clientId: activeClientId },
    orderBy: { createdAt: 'desc' },
  });

  // Convert Date fields to string format for server to client component serializability
  const serializedHistory = history.map((grid) => ({
    ...grid,
    createdAt: grid.createdAt.toISOString(),
  }));

  const hasGbpConnected = !!client.gbpIntegration;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Local Ranking Geo-Grid Heatmap</h1>
        <p className="text-xs text-muted-foreground">
          Map search keyword visibility rankings across local map pack coordinates to audit local SEO and target competitor rankings.
        </p>
      </div>

      <LocalGridManager
        clientId={client.id}
        clientName={client.name}
        clientDomain={client.domain || undefined}
        initialHistory={serializedHistory}
        hasGbpConnected={hasGbpConnected}
      />
    </div>
  );
}
