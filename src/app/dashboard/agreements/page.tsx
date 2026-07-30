import React from 'react';
import { getAgreements, updateAgreementStatus } from '@/features/agreements/actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Plus, ArrowUpRight, DollarSign, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default async function AgreementsPage() {
  const response = await getAgreements();
  const agreements = response.success ? response.data : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Service Agreements</h1>
          <p className="text-sm text-muted-foreground">
            Manage agency SEO contracts, monthly retainers, deliverables, and PDF generation.
          </p>
        </div>
        <Button className="gap-2 shadow-lg">
          <Plus className="h-4 w-4" /> Create New Contract
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agreements.map((item) => (
          <Card key={item.id} className="border-border hover:border-primary/50 transition-all group">
            <CardHeader className="pb-3 flex flex-row items-start justify-between">
              <div className="space-y-1">
                <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                  {item.client.name}
                </Badge>
                <CardTitle className="text-base group-hover:text-primary transition-colors">
                  {item.title}
                </CardTitle>
              </div>
              <Badge variant={item.status === 'SIGNED' ? 'success' : 'outline'}>
                {item.status}
              </Badge>
            </CardHeader>

            <CardContent className="space-y-4 text-xs">
              <div className="flex items-center justify-between py-2 border-y border-border">
                <span className="text-muted-foreground">Retainer Fee</span>
                <span className="font-bold text-emerald-400 flex items-center">
                  <DollarSign className="h-3.5 w-3.5" />
                  {item.monthlyFee.toLocaleString()}/mo
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                <Calendar className="h-3.5 w-3.5" />
                <span>Effective: {formatDate(item.startDate)}</span>
              </div>

              <Link href={`/dashboard/agreements/${item.id}`} className="block">
                <Button variant="outline" size="sm" className="w-full gap-1 text-xs">
                  View Contract & PDF <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}

        {agreements.length === 0 && (
          <div className="col-span-full p-12 text-center border border-dashed border-border rounded-xl">
            <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No service agreements found. Click "Create New Contract" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
