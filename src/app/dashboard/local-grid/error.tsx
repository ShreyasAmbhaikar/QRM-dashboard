'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function LocalGridError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-8 text-center border border-destructive/20 bg-destructive/5 rounded-xl space-y-4">
      <AlertTriangle className="h-8 w-8 text-destructive mx-auto" />
      <div className="space-y-1">
        <h3 className="font-bold text-sm">Failed to load Local Ranking Grid</h3>
        <p className="text-xs text-muted-foreground">{error.message}</p>
      </div>
      <Button variant="outline" size="sm" onClick={reset}>
        Try Again
      </Button>
    </div>
  );
}
