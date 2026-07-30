'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface GridComparisonProps {
  previousAvgRank: number;
  currentAvgRank: number;
}

export function GridComparison({ previousAvgRank, currentAvgRank }: GridComparisonProps) {
  const diff = Number((previousAvgRank - currentAvgRank).toFixed(1));

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Month-Over-Month Ranking Progress</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between text-xs">
        <div>
          <span className="text-muted-foreground block">Previous Avg Rank</span>
          <span className="font-mono font-bold text-base">{previousAvgRank}</span>
        </div>

        <div className="flex items-center gap-1 font-bold text-sm">
          {diff > 0 ? (
            <span className="text-emerald-400 flex items-center gap-1"><ArrowUp className="h-4 w-4" /> +{diff} spots</span>
          ) : diff < 0 ? (
            <span className="text-rose-400 flex items-center gap-1"><ArrowDown className="h-4 w-4" /> {diff} spots</span>
          ) : (
            <span className="text-muted-foreground flex items-center gap-1"><Minus className="h-4 w-4" /> Unchanged</span>
          )}
        </div>

        <div>
          <span className="text-muted-foreground block">Current Avg Rank</span>
          <span className="font-mono font-bold text-base text-primary">{currentAvgRank}</span>
        </div>
      </CardContent>
    </Card>
  );
}
