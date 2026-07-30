'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crosshair, ArrowRight, Zap } from 'lucide-react';

interface GapOpportunity {
  keyword: string;
  volume: number;
  competitorRank: number;
  clientRank: number | null;
  cpc: number;
}

export function KeywordGapTable() {
  const mockGaps: GapOpportunity[] = [
    { keyword: '24 hour plumber emergency', volume: 3400, competitorRank: 2, clientRank: 18, cpc: 4.5 },
    { keyword: 'commercial drain snake near me', volume: 1900, competitorRank: 1, clientRank: null, cpc: 3.8 },
    { keyword: 'water heater installation cost', volume: 4800, competitorRank: 3, clientRank: 24, cpc: 5.2 },
  ];

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Crosshair className="h-4 w-4 text-amber-400" /> Keyword Gap Analysis
        </CardTitle>
        <CardDescription className="text-xs">
          High-value search queries where competitors rank on Page 1 but your client is missing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border border-border rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] font-semibold">
              <tr>
                <th className="px-4 py-2.5">Opportunity Keyword</th>
                <th className="px-4 py-2.5">Search Volume</th>
                <th className="px-4 py-2.5">Competitor Rank</th>
                <th className="px-4 py-2.5">Your Client Rank</th>
                <th className="px-4 py-2.5 text-right">Potential</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockGaps.map((item, idx) => (
                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 font-bold text-foreground">{item.keyword}</td>
                  <td className="px-4 py-2.5 font-mono">{item.volume.toLocaleString()}/mo</td>
                  <td className="px-4 py-2.5">
                    <Badge variant="secondary" className="font-mono text-xs">
                      #{item.competitorRank}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant="outline" className="font-mono text-xs text-muted-foreground">
                      {item.clientRank ? `#${item.clientRank}` : 'Unranked'}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                      <Zap className="h-2.5 w-2.5" /> High Impact
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
