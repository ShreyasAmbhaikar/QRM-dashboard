'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Code } from 'lucide-react';

interface ExportOptionsProps {
  htmlContent: string;
  jsonLdSchema: string;
}

export function ExportOptions({ htmlContent, jsonLdSchema }: ExportOptionsProps) {
  const copyHtml = () => {
    navigator.clipboard.writeText(htmlContent);
    alert('HTML copied to clipboard!');
  };

  const copyJsonLd = () => {
    navigator.clipboard.writeText(jsonLdSchema);
    alert('JSON-LD Schema copied to clipboard!');
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={copyHtml} className="gap-1.5 text-xs">
        <Copy className="h-3.5 w-3.5" /> Copy HTML Content
      </Button>

      <Button variant="outline" size="sm" onClick={copyJsonLd} className="gap-1.5 text-xs">
        <Code className="h-3.5 w-3.5" /> Copy JSON-LD Schema
      </Button>
    </div>
  );
}
