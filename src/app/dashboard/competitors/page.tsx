import React from 'react';
import { getCompetitors } from '@/features/competitors/actions';
import { db } from '@/lib/db';
import { CompetitorMatrix } from '@/features/competitors/components/competitor-matrix';
import { KeywordGapTable } from '@/features/competitors/components/keyword-gap-table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crosshair, Plus, Globe, ExternalLink } from 'lucide-react';

export default async function CompetitorsPage() {
  const response = await getCompetitors();
  const competitors = response.success ? response.data : [];

  const clients = await db.client.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Competitor Analysis</h1>
          <p className="text-sm text-muted-foreground">
            Track domain authority, keyword gap analysis, and share of voice against client rivals.
          </p>
        </div>
        <Button className="gap-2 shadow-lg">
          <Plus className="h-4 w-4" /> Add Competitor Domain
        </Button>
      </div>

      <CompetitorMatrix competitors={competitors} />
      <KeywordGapTable />
    </div>
  );
}
