import React from 'react';
import { db } from '@/lib/db';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GbpConnectButton } from '@/features/gbp/components/gbp-connect-button';
import { Globe, ArrowRight, Building2, Star } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function GbpOverviewPage() {
  let clients: any[] = [];
  try {
    clients = await db.client.findMany({
      include: {
        gbpIntegration: true,
        gbpReviews: true,
      },
      orderBy: { name: 'asc' },
    });
  } catch (e) {
    clients = [];
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Google Business Profile Engine</h1>
          <p className="text-sm text-muted-foreground">
            Manage local location profiles, monitor completeness scores, and respond to Google reviews.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => {
          const isConnected = !!client.gbpIntegration;
          const reviewsCount = client.gbpReviews.length;

          return (
            <Card key={client.id} className="border-border hover:border-primary/50 transition-all">
              <CardHeader className="pb-3 flex flex-row items-start justify-between">
                <div className="space-y-1">
                  <Badge variant="outline" className="text-[10px]">
                    {client.domain}
                  </Badge>
                  <CardTitle className="text-base flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-primary" /> {client.name}
                  </CardTitle>
                </div>
                <Badge variant={isConnected ? 'success' : 'secondary'} className="text-[10px]">
                  {isConnected ? 'Connected' : 'Unlinked'}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                  <span className="text-muted-foreground">Synced Reviews</span>
                  <span className="font-bold flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /> {reviewsCount}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <GbpConnectButton clientId={client.id} isConnected={isConnected} />
                  <Link href={`/dashboard/gbp/${client.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-1 text-xs">
                      Manage <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {clients.length === 0 && (
          <div className="col-span-full p-12 text-center border border-dashed border-border rounded-xl">
            <Globe className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-xs">No clients found in system. Create a client first to link GBP.</p>
          </div>
        )}
      </div>
    </div>
  );
}
