'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export function GridExport() {
  const handleExport = () => {
    alert('Exporting grid snapshot report as client PDF...');
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5 text-xs">
      <Download className="h-3.5 w-3.5" /> Export Grid Report
    </Button>
  );
}
