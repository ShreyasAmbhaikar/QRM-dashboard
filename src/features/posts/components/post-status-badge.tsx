'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { PostStatus } from '@prisma/client';

interface PostStatusBadgeProps {
  status: PostStatus | string;
}

export function PostStatusBadge({ status }: PostStatusBadgeProps) {
  switch (status) {
    case 'PUBLISHED':
      return <Badge variant="success" className="text-[10px]"><CheckCircle2 className="h-3 w-3 mr-1" /> Published</Badge>;
    case 'SCHEDULED':
      return <Badge variant="outline" className="text-[10px] text-blue-400 border-blue-500/30 bg-blue-500/10"><Clock className="h-3 w-3 mr-1" /> Scheduled</Badge>;
    case 'FAILED':
      return <Badge variant="destructive" className="text-[10px]"><AlertCircle className="h-3 w-3 mr-1" /> Failed</Badge>;
    default:
      return <Badge variant="secondary" className="text-[10px]">Draft</Badge>;
  }
}
