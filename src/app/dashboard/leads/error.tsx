'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function LeadsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Leads Error Boundary:', error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-destructive/30 bg-destructive/5 text-center">
        <CardHeader className="space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-bold">Failed to load Lead CRM</CardTitle>
          <CardDescription className="text-sm">
            {error.message || 'An unexpected error occurred.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => reset()} className="w-full gap-2 bg-destructive text-destructive-foreground">
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
