import React from 'react';
import { db } from '@/lib/db';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, ArrowRight, Building2, Star, Plus, ShieldCheck, KeyRound, AlertTriangle } from 'lucide-react';
import { GbpClientSwitcher } from '@/features/gbp/components/gbp-client-switcher';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getActiveClientId } from '@/features/gbp/active-client';

export const dynamic = 'force-dynamic';

export default async function GbpOverviewPage() {
  const activeClientId = await getActiveClientId();
  if (activeClientId) {
    redirect(`/dashboard/gbp/${activeClientId}`);
  }

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

  const connectedCount = clients.filter(c => !!c.gbpIntegration).length;

  return (
    <div className="space-y-8 select-none">
      {/* Premium Hero Banner (Semrush/Ahrefs style) */}
      <div className="relative overflow-hidden rounded-xl bg-card border border-border p-6 md:p-8 shadow-sm">
        {/* Accent Glow */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 px-2 py-0.5 text-[10px] font-semibold rounded-md">
                Local SEO Engine
              </Badge>
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                GBP Integration Active
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Google Business Profile Manager
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Link your agency or client Google Accounts to fetch listings, track local grid performance, monitor completeness, and automate review responses with AI.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {connectedCount > 0 && (
              <GbpClientSwitcher clients={clients.filter(c => !!c.gbpIntegration)} />
            )}
            <a href="/api/integrations/google/connect?clientId=import">
              <Button size="sm" className="gap-2 shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold h-9 px-4 rounded-md w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                Connect Google Account
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Integration KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Card className="border-border bg-card shadow-sm hover:border-primary/30 transition-all rounded-lg text-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Connected Clients</span>
              <div className="text-2xl font-extrabold">{connectedCount} / {clients.length}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <Building2 className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm hover:border-violet-500/30 transition-all rounded-lg text-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Synced Locations</span>
              <div className="text-2xl font-extrabold">
                {clients.filter(c => c.gbpIntegration?.locationId).length}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400">
              <Globe className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm hover:border-amber-500/30 transition-all rounded-lg text-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Reviews Synced</span>
              <div className="text-2xl font-extrabold">
                {clients.reduce((acc, c) => acc + c.gbpReviews.length, 0)}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Star className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients List Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-foreground">Client Profiles & Link Status</h2>
          <p className="text-xs text-muted-foreground">Monitor profile connection statuses and link listings directly to individual clients.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => {
            const isConnected = !!client.gbpIntegration;
            const reviewsCount = client.gbpReviews.length;
            const locationId = client.gbpIntegration?.locationId || '';

            return (
              <Card key={client.id} className="border-border hover:border-primary/50 transition-all flex flex-col justify-between">
                <CardHeader className="pb-3 flex flex-row items-start justify-between">
                  <div className="space-y-1.5 min-w-0 flex-1 pr-2">
                    <Badge variant="outline" className="text-[9px] truncate max-w-full font-mono bg-muted/20">
                      {client.domain}
                    </Badge>
                    <CardTitle className="text-sm font-bold flex items-center gap-1.5 truncate">
                      <Building2 className="h-4 w-4 text-primary shrink-0" />
                      <span className="truncate">{client.name}</span>
                    </CardTitle>
                  </div>
                  <Badge variant={isConnected ? 'success' : 'secondary'} className="text-[9px] shrink-0">
                    {isConnected ? 'Connected' : 'Unlinked'}
                  </Badge>
                </CardHeader>
                
                <CardContent className="space-y-4 text-xs flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                      <span className="text-muted-foreground">Google Reviews</span>
                      <span className="font-bold flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /> {reviewsCount}
                      </span>
                    </div>

                    {isConnected && (
                      <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/10 text-muted-foreground space-y-1.5">
                        <div className="flex justify-between items-center text-[10px]">
                          <span>Location ID:</span>
                          <span className="font-mono text-foreground font-semibold truncate max-w-[120px]" title={locationId}>
                            {locationId.split('/').pop() || locationId}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span>Completeness:</span>
                          <span className="font-semibold text-emerald-400">
                            {client.gbpIntegration?.profileScore || 0}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    {isConnected ? (
                      <Link href={`/dashboard/gbp/${client.id}`} className="w-full">
                        <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs h-8">
                          Manage Profiles <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    ) : (
                      <a href={`/api/integrations/google/connect?clientId=${client.id}`} className="w-full">
                        <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs text-primary border-primary/20 hover:bg-primary/5 h-8">
                          <KeyRound className="h-3.5 w-3.5" /> Direct Link
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {clients.length === 0 && (
            <div className="col-span-full p-12 text-center border border-dashed border-border rounded-xl">
              <Globe className="h-8 w-8 mx-auto text-muted-foreground mb-2 animate-pulse" />
              <p className="text-muted-foreground text-xs font-medium">No clients found in system. Create a client first to link GBP.</p>
              <Link href="/dashboard/clients" className="inline-block mt-3">
                <Button size="sm" className="text-xs">Go to Clients</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
