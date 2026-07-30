import React from 'react';
import { getClientById } from '@/features/clients/actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, ShieldCheck, Search, Crosshair, MapPin, ListTodo, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const response = await getClientById(id);

  if (!response.success || !response.data) {
    notFound();
  }

  const client = response.data;

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/clients">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm"
            style={{ backgroundColor: client.primaryColor || '#3b82f6' }}
          >
            {client.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{client.name}</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Globe className="h-3 w-3" /> {client.domain} • {client.industry || 'General Industry'}
            </p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Badge variant={client.status === 'ACTIVE' ? 'success' : 'outline'}>
            {client.status}
          </Badge>
          <Badge variant="outline" className="border-primary/40 text-primary">
            Health: {client.healthScore}/100
          </Badge>
        </div>
      </div>

      {/* Main Sub-Tabs Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Keywords Overview */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" /> Tracked Keywords
              </CardTitle>
              <CardDescription>Target terms & current SERP positions</CardDescription>
            </div>
            <Link href={`/dashboard/keywords?clientId=${client.id}`}>
              <Button variant="outline" size="sm" className="text-xs">
                Keyword Hub
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {client.keywords?.map((kw) => (
                <div
                  key={kw.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20 text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold text-foreground">{kw.term}</span>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                      <span>Volume: {kw.searchVolume}</span>
                      <span>CPC: ${kw.cpc}</span>
                      <span>Intent: {kw.intent}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      Rank #{kw.currentRank || 'N/A'}
                    </Badge>
                  </div>
                </div>
              ))}

              {(!client.keywords || client.keywords.length === 0) && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No tracked keywords found for this client.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Competitors & Tasks */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Crosshair className="h-4 w-4 text-destructive" /> Competitors
              </CardTitle>
              <CardDescription>Tracked domain competitors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {client.competitors?.map((comp) => (
                  <div
                    key={comp.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/20 text-xs"
                  >
                    <span className="font-medium truncate">{comp.domain}</span>
                    <Badge variant="outline" className="text-[10px]">
                      DA {comp.domainAuthority}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ListTodo className="h-4 w-4 text-amber-500" /> Pending Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {client.tasks?.map((task) => (
                  <div
                    key={task.id}
                    className="p-2.5 rounded-lg border border-border bg-muted/20 text-xs space-y-1"
                  >
                    <div className="font-medium">{task.title}</div>
                    <Badge variant="outline" className="text-[10px]">
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
