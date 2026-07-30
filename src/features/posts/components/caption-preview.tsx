'use client';

import React from 'react';

interface CaptionPreviewProps {
  caption: string;
}

export function CaptionPreview({ caption }: CaptionPreviewProps) {
  const charCount = caption.length;
  const isNearLimit = charCount > 1200;

  return (
    <div className="space-y-1.5 text-xs">
      <div className="flex items-center justify-between text-muted-foreground">
        <span>Caption Character Limit</span>
        <span className={`font-mono font-bold ${isNearLimit ? 'text-amber-400' : 'text-emerald-400'}`}>
          {charCount} / 1500 chars
        </span>
      </div>
      <div className="p-3 rounded-lg border border-border bg-card/60 leading-relaxed text-foreground whitespace-pre-wrap">
        {caption || <span className="text-muted-foreground italic">Generated caption preview will appear here...</span>}
      </div>
    </div>
  );
}
