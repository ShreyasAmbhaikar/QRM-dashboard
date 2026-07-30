'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export function ReplyApprovalFlow() {
  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" /> Three-Tier Approval Workflow
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/20">
          <Badge variant="secondary" className="text-[10px]">1. Draft</Badge>
          <span>Content Writer generates AI response draft</span>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/20">
          <Badge variant="outline" className="text-[10px] text-blue-400 border-blue-500/30">2. Review</Badge>
          <span>Manager reviews & edits response</span>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/20">
          <Badge variant="success" className="text-[10px]">3. Publish</Badge>
          <span>Published to GBP via Google API</span>
        </div>
      </CardContent>
    </Card>
  );
}
