'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

export type GraphicEngineMode = 'MODE_A' | 'MODE_B';

interface GraphicModeToggleProps {
  mode: GraphicEngineMode;
  onModeChange: (mode: GraphicEngineMode) => void;
}

export function GraphicModeToggle({ mode, onModeChange }: GraphicModeToggleProps) {
  return (
    <div className="flex items-center gap-2 p-1 bg-muted/40 rounded-lg border border-border">
      <Button
        type="button"
        variant={mode === 'MODE_B' ? 'secondary' : 'ghost'}
        size="sm"
        className="text-xs flex-1 gap-1.5"
        onClick={() => onModeChange('MODE_B')}
      >
        <span>🎨</span> Mode B: Hybrid Canvas (0% Typos)
      </Button>

      <Button
        type="button"
        variant={mode === 'MODE_A' ? 'secondary' : 'ghost'}
        size="sm"
        className="text-xs flex-1 gap-1.5"
        onClick={() => onModeChange('MODE_A')}
      >
        <span>✨</span> Mode A: Direct AI Flyer (Ideogram/Imagen)
      </Button>
    </div>
  );
}
