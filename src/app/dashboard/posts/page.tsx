import React from 'react';
import { db } from '@/lib/db';
import { PostCalendar } from '@/features/posts/components/post-calendar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Calendar, Image as ImageIcon } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PostsOverviewPage() {
  let posts: any[] = [];
  try {
    posts = await db.post.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  } catch (e) {
    posts = [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">GBP Post Generator & Dual-Mode Graphic Engine</h1>
        <p className="text-sm text-muted-foreground">
          Generate AI post captions, render branded 1200×900 graphics, and schedule auto-publishing to Google Business Profile.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> AI Copywriting
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Promotional, Educational, Offer & Event prompt templates tailored to client location keywords.
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" /> Dual-Mode Graphic Engine
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Mode A for full AI flyers or Mode B for 0% typo Satori SVG canvas templates with brand logos.
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" /> Auto-Scheduler
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            BullMQ delayed task worker posts directly to GBP via Google My Business API at your chosen time.
          </CardContent>
        </Card>
      </div>

      <PostCalendar posts={posts} />
    </div>
  );
}
