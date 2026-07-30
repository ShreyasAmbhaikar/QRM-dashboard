'use client';

import React from 'react';

interface ContentPreviewProps {
  htmlContent: string;
}

export function ContentPreview({ htmlContent }: ContentPreviewProps) {
  return (
    <div className="p-6 rounded-xl border border-border bg-card/60 space-y-4 text-xs leading-relaxed">
      <div className="prose prose-invert max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
}
