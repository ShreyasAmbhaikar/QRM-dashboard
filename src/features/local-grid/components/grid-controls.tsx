'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface GridControlsProps {
  gridSize: 3 | 5 | 7;
  radiusMiles: number;
  onSizeChange: (size: 3 | 5 | 7) => void;
  onRadiusChange: (radius: number) => void;
}

export function GridControls({ gridSize, radiusMiles, onSizeChange, onRadiusChange }: GridControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg border border-border bg-card/40 text-xs">
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground">Grid Size:</span>
        {([3, 5, 7] as const).map((s) => (
          <Button
            key={s}
            type="button"
            variant={gridSize === s ? 'secondary' : 'outline'}
            size="sm"
            className="h-7 text-xs px-2.5"
            onClick={() => onSizeChange(s)}
          >
            {s}×{s}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        <span className="text-muted-foreground">Radius:</span>
        {[1, 2, 5, 10].map((r) => (
          <Button
            key={r}
            type="button"
            variant={radiusMiles === r ? 'secondary' : 'outline'}
            size="sm"
            className="h-7 text-xs px-2.5"
            onClick={() => onRadiusChange(r)}
          >
            {r} mi
          </Button>
        ))}
      </div>
    </div>
  );
}
