'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';

interface IntegrationCardProps {
  name: string;
  description: string;
  isConnected: boolean;
  onConnect?: () => void;
}

export function IntegrationCard({ name, description, isConnected, onConnect }: IntegrationCardProps) {
  return (
    <Card className="border-border">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm">{name}</CardTitle>
        <Badge variant={isConnected ? 'success' : 'outline'} className="text-[10px]">
          {isConnected ? <><CheckCircle2 className="h-3 w-3 mr-1" /> Connected</> : <><XCircle className="h-3 w-3 mr-1" /> Not Configured</>}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <p className="text-muted-foreground">{description}</p>
        <Button variant="outline" size="sm" onClick={onConnect} className="w-full text-xs">
          {isConnected ? 'Test Connection' : 'Configure Integration'}
        </Button>
      </CardContent>
    </Card>
  );
}
