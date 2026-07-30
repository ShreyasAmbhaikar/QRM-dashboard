'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

export type PostType = 'PROMOTIONAL' | 'EDUCATIONAL' | 'OFFER' | 'EVENT';

interface PostTypeSelectorProps {
  selectedType: PostType;
  onSelectType: (type: PostType) => void;
}

const POST_TYPES: { label: string; type: PostType; icon: string }[] = [
  { label: 'Promotional', type: 'PROMOTIONAL', icon: '📢' },
  { label: 'Educational', type: 'EDUCATIONAL', icon: '💡' },
  { label: 'Special Offer', type: 'OFFER', icon: '🏷️' },
  { label: 'Event', type: 'EVENT', icon: '📅' },
];

export function PostTypeSelector({ selectedType, onSelectType }: PostTypeSelectorProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
      {POST_TYPES.map((t) => (
        <Button
          key={t.type}
          type="button"
          variant={selectedType === t.type ? 'secondary' : 'outline'}
          size="sm"
          className="h-7 text-[11px] gap-1 px-2.5"
          onClick={() => onSelectType(t.type)}
        >
          <span>{t.icon}</span>
          <span>{t.label}</span>
        </Button>
      ))}
    </div>
  );
}
