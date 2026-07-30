import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Globe, Search, ArrowUpRight, ShieldCheck, MoreVertical } from 'lucide-react';
import { getClients } from '@/features/clients/actions';

export default async function ClientsPage() {
  const response = await getClients();
  const clients = response.success ? response.data : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Client Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage your agency SEO clients, domain profiles, and health indicators.
          </p>
        </div>
        <Button className="gap-2 shadow-lg">
          <Plus className="h-4 w-4" /> Add New Client
        </Button>
      </div>

      {/* Client List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <Card key={client.id} className="border-border hover:border-primary/50 transition-all group">
            <CardHeader className="flex flex-row items-start justify-between pb-3">
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm"
                  style={{ backgroundColor: client.primaryColor || '#3b82f6' }}
                >
                  {client.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <CardTitle className="text-base group-hover:text-primary transition-colors">
                    {client.name}
                  </CardTitle>
                  <CardDescription className="text-xs flex items-center gap-1 mt-0.5">
                    <Globe className="h-3 w-3" />
                    {client.domain}
                  </CardDescription>
                </div>
              </div>
              <Badge variant={client.status === 'ACTIVE' ? 'success' : 'outline'}>
                {client.status}
              </Badge>
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              <div className="flex items-center justify-between text-xs py-2 border-y border-border">
                <span className="text-muted-foreground">Health Score</span>
                <span className="font-bold text-success flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {client.healthScore}/100
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-muted/40">
                  <div className="font-bold text-sm">{client._count?.keywords || 0}</div>
                  <div className="text-[10px] text-muted-foreground">Keywords</div>
                </div>
                <div className="p-2 rounded-lg bg-muted/40">
                  <div className="font-bold text-sm">{client._count?.competitors || 0}</div>
                  <div className="text-[10px] text-muted-foreground">Competitors</div>
                </div>
                <div className="p-2 rounded-lg bg-muted/40">
                  <div className="font-bold text-sm">{client._count?.tasks || 0}</div>
                  <div className="text-[10px] text-muted-foreground">Open Tasks</div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Link href={`/dashboard/clients/${client.id}`} className="w-full">
                  <Button variant="outline" size="sm" className="w-full gap-1 text-xs">
                    View Details <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}

        {clients.length === 0 && (
          <div className="col-span-full p-12 text-center border border-dashed border-border rounded-xl">
            <p className="text-muted-foreground">No clients found. Click "Add New Client" to create your first client profile.</p>
          </div>
        )}
      </div>
    </div>
  );
}
