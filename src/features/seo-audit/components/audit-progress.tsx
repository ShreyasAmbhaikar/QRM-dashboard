'use client';

import React from 'react';

interface AuditProgressProps {
  crawled: number;
  total: number;
}

export function AuditProgress({ crawled, total }: AuditProgressProps) {
  const percent = total > 0 ? Math.round((crawled / total) * 100) : 0;

  return (
    <div className="space-y-2 text-xs">
      <div className="flex items-center justify-between text-muted-foreground">
        <span>Crawling Pages... ({crawled} / {total})</span>
        <span className="font-mono font-bold text-primary">{percent}%</span>
      </div>
      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
