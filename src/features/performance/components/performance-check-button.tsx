'use client';

import React, { useState } from 'react';
import { runPerformanceCheck } from '../actions';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface PerformanceCheckButtonProps {
  clientId: string;
}

export function PerformanceCheckButton({ clientId }: PerformanceCheckButtonProps) {
  const [running, setRunning] = useState(false);

  const handleClick = async () => {
    setRunning(true);
    try {
      await runPerformanceCheck({ clientId });
    } finally {
      setRunning(false);
    }
  };

  return (
    <Button size="sm" disabled={running} onClick={handleClick} className="gap-1.5 text-xs">
      <Play className="h-3.5 w-3.5" /> {running ? 'Checking...' : 'Run PageSpeed Audit'}
    </Button>
  );
}
