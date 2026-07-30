import React from 'react';
import { Badge } from '@/components/ui/badge';

export function LeadScoreBadge({ score }: { score: number }) {
  let colorClass = 'border-destructive/40 text-destructive bg-destructive/10';
  if (score >= 80) {
    colorClass = 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10';
  } else if (score >= 50) {
    colorClass = 'border-amber-500/40 text-amber-400 bg-amber-500/10';
  }

  return (
    <Badge variant="outline" className={`font-mono text-[10px] ${colorClass}`}>
      Score: {score}/100
    </Badge>
  );
}
