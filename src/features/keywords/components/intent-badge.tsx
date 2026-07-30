import React from 'react';
import { Badge } from '@/components/ui/badge';

interface IntentBadgeProps {
  intent: string;
}

export function IntentBadge({ intent }: IntentBadgeProps) {
  const normalized = intent.toUpperCase();

  let colorClass = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  if (normalized.includes('TRANSACTIONAL')) {
    colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  } else if (normalized.includes('COMMERCIAL')) {
    colorClass = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
  } else if (normalized.includes('NAVIGATIONAL')) {
    colorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${colorClass}`}>
      {intent}
    </span>
  );
}
