import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function LocalGridLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}
