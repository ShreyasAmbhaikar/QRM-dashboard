'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Globe, CheckCircle2 } from 'lucide-react';

interface GbpConnectButtonProps {
  clientId: string;
  isConnected?: boolean;
}

export function GbpConnectButton({ clientId, isConnected }: GbpConnectButtonProps) {
  const handleConnect = () => {
    window.location.href = `/api/integrations/google/connect?clientId=${clientId}`;
  };

  return isConnected ? (
    <Button variant="outline" className="gap-2 text-xs border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
      <CheckCircle2 className="h-4 w-4" /> GBP Connected
    </Button>
  ) : (
    <Button onClick={handleConnect} className="gap-2 text-xs shadow-lg bg-blue-600 hover:bg-blue-500 text-white">
      <Globe className="h-4 w-4" /> Connect Google Business Profile
    </Button>
  );
}
