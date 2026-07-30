'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare } from 'lucide-react';
import { GbpReview } from '@prisma/client';

interface GbpReviewTableProps {
  reviews: GbpReview[];
}

export function GbpReviewTable({ reviews }: GbpReviewTableProps) {
  const [ratingFilter, setRatingFilter] = useState<number | 'ALL'>('ALL');

  const filtered = ratingFilter === 'ALL' ? reviews : reviews.filter((r) => r.rating === ratingFilter);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">Filter by Star Rating:</span>
        <button
          onClick={() => setRatingFilter('ALL')}
          className={`px-2.5 py-1 rounded-md border text-[11px] ${ratingFilter === 'ALL' ? 'bg-primary text-primary-foreground' : 'border-border'}`}
        >
          All ({reviews.length})
        </button>
        {[5, 4, 3, 2, 1].map((stars) => (
          <button
            key={stars}
            onClick={() => setRatingFilter(stars)}
            className={`px-2.5 py-1 rounded-md border text-[11px] flex items-center gap-1 ${ratingFilter === stars ? 'bg-primary text-primary-foreground' : 'border-border'}`}
          >
            <span>{stars}</span>
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px]">
            <tr>
              <th className="p-3">Reviewer</th>
              <th className="p-3">Rating</th>
              <th className="p-3">Comment</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((rev) => (
              <tr key={rev.id} className="hover:bg-muted/10">
                <td className="p-3 font-semibold text-foreground">{rev.reviewerName}</td>
                <td className="p-3 font-mono font-bold text-amber-400">{rev.rating} ★</td>
                <td className="p-3 text-muted-foreground max-w-xs truncate">{rev.comment || 'No text'}</td>
                <td className="p-3">
                  <Badge variant={rev.replyStatus === 'PUBLISHED' ? 'success' : 'outline'} className="text-[10px]">
                    {rev.replyStatus}
                  </Badge>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-muted-foreground">No reviews match the selected filter.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
