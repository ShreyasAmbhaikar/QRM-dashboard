'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Zap, CheckCircle2 } from 'lucide-react';

export function OpportunityList() {
  const opps = [
    { title: 'Eliminate render-blocking resources', savings: 'Est. 0.45s savings', impact: 'HIGH' },
    { title: 'Properly size images & serve next-gen WebP formats', savings: 'Est. 340 KB savings', impact: 'MEDIUM' },
    { title: 'Enable text compression (Gzip / Brotli)', savings: 'Est. 0.2s savings', impact: 'MEDIUM' },
  ];

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-400" /> Lighthouse Optimization Opportunities
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        {opps.map((o, idx) => (
          <div key={idx} className="p-3 rounded-lg border border-border bg-card/40 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-semibold text-foreground">{o.title}</span>
              <span className="text-muted-foreground block text-[10px]">{o.savings}</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
              {o.impact} IMPACT
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
