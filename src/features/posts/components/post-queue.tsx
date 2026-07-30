'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Send } from 'lucide-react';
import { Post } from '@prisma/client';

interface PostQueueProps {
  scheduledPosts: Post[];
}

export function PostQueue({ scheduledPosts }: PostQueueProps) {
  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-400" /> Upcoming Post Publishing Queue ({scheduledPosts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        {scheduledPosts.map((post) => (
          <div key={post.id} className="p-3 rounded-lg border border-blue-500/20 bg-blue-500/5 flex items-start justify-between">
            <div className="space-y-1">
              <span className="font-semibold text-foreground">{post.title}</span>
              <p className="text-muted-foreground line-clamp-1">{post.summary}</p>
            </div>
            <Badge variant="outline" className="text-[10px] text-blue-400 border-blue-500/30">
              <Clock className="h-3 w-3 mr-1" /> {post.scheduledFor ? new Date(post.scheduledFor).toLocaleString() : 'Queued'}
            </Badge>
          </div>
        ))}
        {scheduledPosts.length === 0 && (
          <p className="text-muted-foreground text-center py-4">No upcoming posts queued.</p>
        )}
      </CardContent>
    </Card>
  );
}
