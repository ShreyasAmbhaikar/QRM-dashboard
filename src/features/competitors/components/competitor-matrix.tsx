'use client';

import React from 'react';
import { CompetitorWithClient } from '../actions';
import { Badge } from '@/components/ui/badge';
import { Globe, TrendingUp, BarChart2 } from 'lucide-react';

interface CompetitorMatrixProps {
  competitors: CompetitorWithClient[];
}

export function CompetitorMatrix({ competitors }: CompetitorMatrixProps) {
  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
      <div className="p-4 border-b border-border bg-muted/30">
        <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-primary" /> Domain Comparison Matrix
        </h3>
      </div>

      <div className="overflow-x-auto text-xs">
        <table className="w-full text-left">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] font-semibold">
            <tr>
              <th className="px-4 py-2.5">Competitor Domain</th>
              <th className="px-4 py-2.5">Assigned Client</th>
              <th className="px-4 py-2.5">Domain Authority</th>
              <th className="px-4 py-2.5">Est. Monthly Traffic</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {competitors.map((item) => (
              <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-bold text-foreground flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  {item.domain}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="text-[10px]">
                    {item.client.name}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="destructive" className="font-mono text-xs">
                    DA {item.domainAuthority}
                  </Badge>
                </td>
                <td className="px-4 py-3 font-mono font-semibold text-emerald-400">
                  {item.estimatedTraffic.toLocaleString()}/mo
                </td>
              </tr>
            ))}

            {competitors.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground text-xs">
                  No competitors tracked in database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
