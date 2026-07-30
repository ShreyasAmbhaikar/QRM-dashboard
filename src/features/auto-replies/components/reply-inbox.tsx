'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Star } from 'lucide-react';
import { GbpReview } from '@prisma/client';

interface ReplyInboxProps {
  reviews: GbpReview[];
}

export function ReplyInbox({ reviews }: ReplyInboxProps) {
  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" /> Pending Review Response Queue ({reviews.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        {reviews.map((rev) => (
          <div key={rev.id} className="p-3 rounded-lg border border-border bg-card/40 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{rev.reviewerName}</span>
                <span className="text-amber-400 font-bold">{rev.rating} ★</span>
                <Badge variant={rev.replyStatus === 'PUBLISHED' ? 'success' : 'outline'} className="text-[10px]">
                  {rev.replyStatus}
                </Badge>
              </div>
              <p className="text-muted-foreground line-clamp-2">{rev.comment || 'No review comment'}</p>
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="text-muted-foreground text-center py-4">No pending reviews requiring responses.</p>
        )}
      </CardContent>
    </Card>
  );
}
