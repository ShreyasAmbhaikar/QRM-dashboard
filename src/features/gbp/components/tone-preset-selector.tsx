'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

export type TonePreset = 'PROFESSIONAL' | 'FRIENDLY' | 'APOLOGETIC' | 'GRATITUDE';

interface TonePresetSelectorProps {
  selectedTone: TonePreset;
  onSelectTone: (tone: TonePreset) => void;
}

const PRESETS: { label: string; tone: TonePreset; icon: string }[] = [
  { label: 'Professional', tone: 'PROFESSIONAL', icon: '👔' },
  { label: 'Friendly', tone: 'FRIENDLY', icon: '😊' },
  { label: 'Apologetic', tone: 'APOLOGETIC', icon: '🙏' },
  { label: 'Gratitude', tone: 'GRATITUDE', icon: '⭐' },
];

export function TonePresetSelector({ selectedTone, onSelectTone }: TonePresetSelectorProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
      {PRESETS.map((p) => (
        <Button
          key={p.tone}
          type="button"
          variant={selectedTone === p.tone ? 'secondary' : 'outline'}
          size="sm"
          className="h-7 text-[11px] gap-1 px-2.5"
          onClick={() => onSelectTone(p.tone)}
        >
          <span>{p.icon}</span>
          <span>{p.label}</span>
        </Button>
      ))}
    </div>
  );
}
