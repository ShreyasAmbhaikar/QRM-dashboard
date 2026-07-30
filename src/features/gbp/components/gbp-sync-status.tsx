'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle2 } from 'lucide-react';

interface GbpSyncStatusProps {
  lastSyncedAt?: Date | string;
  onSync?: () => Promise<void>;
}

export function GbpSyncStatus({ lastSyncedAt, onSync }: GbpSyncStatusProps) {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    if (!onSync) return;
    setSyncing(true);
    try {
      await onSync();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/40 text-xs">
      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
      <div className="flex-1">
        <span className="font-medium text-foreground block">GBP Auto-Sync Status</span>
        <span className="text-[10px] text-muted-foreground">
          Last synced: {lastSyncedAt ? new Date(lastSyncedAt).toLocaleString() : 'Just now'}
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        disabled={syncing}
        onClick={handleSync}
        className="gap-1.5 text-xs h-7"
      >
        <RefreshCw className={`h-3 w-3 ${syncing ? 'animate-spin' : ''}`} />
        {syncing ? 'Syncing...' : 'Sync Now'}
      </Button>
    </div>
  );
}
