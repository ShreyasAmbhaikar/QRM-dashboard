'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Card className="border-destructive/30 bg-destructive/10 max-w-lg mx-auto mt-12">
      <CardHeader>
        <CardTitle className="text-base text-destructive flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" /> Backlinks Error
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        <p className="text-muted-foreground">{error.message || 'An error occurred loading backlinks data.'}</p>
        <Button variant="outline" size="sm" onClick={() => reset()} className="text-xs">
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
}
