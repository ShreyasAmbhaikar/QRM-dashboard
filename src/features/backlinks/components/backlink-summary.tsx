'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Link2, ShieldAlert, Award } from 'lucide-react';

interface BacklinkSummaryProps {
  totalBacklinks: number;
  avgDomainAuthority: number;
  toxicCount: number;
}

export function BacklinkSummary({ totalBacklinks, avgDomainAuthority, toxicCount }: BacklinkSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
      <Card className="border-border">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
            <Link2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px]">Total Referring Domains</span>
            <span className="font-mono font-bold text-xl text-foreground">{totalBacklinks}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px]">Average Domain Authority</span>
            <span className="font-mono font-bold text-xl text-emerald-400">{avgDomainAuthority} / 100</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px]">Toxic Links Flagged</span>
            <span className="font-mono font-bold text-xl text-rose-400">{toxicCount}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
