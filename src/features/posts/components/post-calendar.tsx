'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Post } from '@prisma/client';

interface PostCalendarProps {
  posts: Post[];
}

export function PostCalendar({ posts }: PostCalendarProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <Badge variant="success" className="text-[10px]"><CheckCircle className="h-3 w-3 mr-1" /> Published</Badge>;
      case 'SCHEDULED':
        return <Badge variant="outline" className="text-[10px] text-blue-400 border-blue-500/30 bg-blue-500/10"><Clock className="h-3 w-3 mr-1" /> Scheduled</Badge>;
      case 'FAILED':
        return <Badge variant="destructive" className="text-[10px]"><AlertCircle className="h-3 w-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge variant="secondary" className="text-[10px]">Draft</Badge>;
    }
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-primary" /> Scheduled & Published Post History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="p-3 rounded-lg border border-border bg-card/40 flex items-start justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] font-mono">{post.title}</Badge>
                  {getStatusBadge(post.status)}
                </div>
                <p className="line-clamp-2 text-foreground">{post.summary}</p>
                <span className="text-[10px] text-muted-foreground block">
                  {post.scheduledFor ? `Scheduled for: ${new Date(post.scheduledFor).toLocaleString()}` : `Created: ${new Date(post.createdAt).toLocaleDateString()}`}
                </span>
              </div>
            </div>
          ))}

          {posts.length === 0 && (
            <div className="p-6 text-center border border-dashed border-border rounded-lg text-muted-foreground text-xs">
              No GBP posts scheduled or published yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
