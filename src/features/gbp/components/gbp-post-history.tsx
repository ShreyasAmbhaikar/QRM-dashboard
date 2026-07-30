'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2 } from 'lucide-react';
import { Post } from '@prisma/client';

interface GbpPostHistoryProps {
  posts: Post[];
}

export function GbpPostHistory({ posts }: GbpPostHistoryProps) {
  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" /> GBP Published Updates History ({posts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        {posts.map((post) => (
          <div key={post.id} className="p-3 rounded-lg border border-border bg-card/40 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{post.title}</span>
                <Badge variant={post.status === 'PUBLISHED' ? 'success' : 'outline'} className="text-[10px]">
                  {post.status}
                </Badge>
              </div>
              <p className="text-muted-foreground line-clamp-1">{post.summary}</p>
            </div>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
        ))}
        {posts.length === 0 && (
          <p className="text-muted-foreground text-center py-4">No GBP post history recorded.</p>
        )}
      </CardContent>
    </Card>
  );
}
