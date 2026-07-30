'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gauge } from 'lucide-react';

interface CwvScoresProps {
  cwv: {
    lcp: string;
    cls: string;
    inp: string;
    performanceScore: number;
  };
}

export function CwvScores({ cwv }: CwvScoresProps) {
  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Gauge className="h-4 w-4 text-emerald-400" /> Core Web Vitals Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-lg border border-border bg-card/40">
          <span className="text-muted-foreground block text-[10px]">Lighthouse Grade</span>
          <span className="font-mono font-bold text-lg text-emerald-400">{cwv.performanceScore} / 100</span>
        </div>

        <div className="p-3 rounded-lg border border-border bg-card/40">
          <span className="text-muted-foreground block text-[10px]">LCP (Largest Contentful Paint)</span>
          <span className="font-mono font-bold text-lg text-foreground">{cwv.lcp}</span>
          <Badge variant="success" className="text-[9px] mt-1 block w-fit">Good (&lt; 2.5s)</Badge>
        </div>

        <div className="p-3 rounded-lg border border-border bg-card/40">
          <span className="text-muted-foreground block text-[10px]">CLS (Cumulative Layout Shift)</span>
          <span className="font-mono font-bold text-lg text-foreground">{cwv.cls}</span>
          <Badge variant="success" className="text-[9px] mt-1 block w-fit">Good (&lt; 0.1)</Badge>
        </div>

        <div className="p-3 rounded-lg border border-border bg-card/40">
          <span className="text-muted-foreground block text-[10px]">INP (Interaction to Next Paint)</span>
          <span className="font-mono font-bold text-lg text-foreground">{cwv.inp}</span>
          <Badge variant="success" className="text-[9px] mt-1 block w-fit">Good (&lt; 200ms)</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
