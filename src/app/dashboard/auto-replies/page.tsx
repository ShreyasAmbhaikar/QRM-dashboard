import React from 'react';
import { db } from '@/lib/db';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ReviewFeed } from '@/features/gbp/components/review-feed';
import { MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AutoRepliesPage() {
  let reviews: any[] = [];
  try {
    reviews = await db.gbpReview.findMany({
      orderBy: { fetchedAt: 'desc' },
      take: 20,
    });
  } catch (e) {
    reviews = [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Review Auto-Reply & Approval Workflow</h1>
        <p className="text-sm text-muted-foreground">
          Review incoming Google customer feedback, draft contextual AI responses, and manage approval before publishing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Tone Presets
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Select between Professional, Friendly, Apologetic, or Gratitude response styles.
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> RBAC Approval Gate
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Content Writers save drafts → Managers and Super Admins review and publish to Google.
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" /> Multi-Location Inbox
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Centralized inbox for all client Google Business Profile accounts.
          </CardContent>
        </Card>
      </div>

      <ReviewFeed reviews={reviews} />
    </div>
  );
}
