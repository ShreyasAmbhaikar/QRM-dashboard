'use client';

import React from 'react';

interface JsonLdPreviewProps {
  jsonLdSchema: string;
}

export function JsonLdPreview({ jsonLdSchema }: JsonLdPreviewProps) {
  let formatted = jsonLdSchema;
  try {
    formatted = JSON.stringify(JSON.parse(jsonLdSchema), null, 2);
  } catch (e) {}

  return (
    <div className="space-y-2 text-xs">
      <span className="font-semibold text-muted-foreground uppercase tracking-wider block">Schema.org JSON-LD Markup</span>
      <pre className="p-4 rounded-xl border border-border bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto">
        {formatted}
      </pre>
    </div>
  );
}
