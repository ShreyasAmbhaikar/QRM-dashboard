'use client';

import React from 'react';
import { ReviewReplyComposer } from './review-reply-composer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, CheckCircle2 } from 'lucide-react';
import { GbpReview } from '@prisma/client';

interface ReviewFeedProps {
  reviews: GbpReview[];
  onRefresh?: () => void;
}

export function ReviewFeed({ reviews, onRefresh }: ReviewFeedProps) {
  return (
    <Card className="border-border">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" /> Unified GBP Review Feed ({reviews.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {reviews.map((rev) => (
          <div key={rev.id} className="p-4 rounded-xl border border-border bg-card/60 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-sm">{rev.reviewerName}</span>
                <div className="flex items-center text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-muted'}`}
                    />
                  ))}
                </div>
              </div>

              <Badge
                variant={rev.replyStatus === 'PUBLISHED' ? 'success' : 'outline'}
                className="text-[10px]"
              >
                {rev.replyStatus}
              </Badge>
            </div>

            {rev.comment && <p className="text-muted-foreground leading-relaxed">{rev.comment}</p>}

            {rev.replyStatus === 'PUBLISHED' ? (
              <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 space-y-1">
                <span className="font-semibold text-[10px] uppercase tracking-wider block flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Published Response
                </span>
                <p className="text-foreground">{rev.replyText}</p>
              </div>
            ) : (
              <ReviewReplyComposer review={rev} onPublished={onRefresh} />
            )}
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="p-8 text-center border border-dashed border-border rounded-xl text-muted-foreground text-xs">
            No reviews synced for this location yet. Click "Connect GBP" or "Sync Reviews" to import.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
