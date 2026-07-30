'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, AlertTriangle, FileText } from 'lucide-react';

interface AuditSummaryProps {
  healthScore: number;
  pagesCrawled: number;
  errorCount: number;
  warningCount: number;
  noticeCount: number;
}

export function AuditSummary({ healthScore, pagesCrawled, errorCount, warningCount, noticeCount }: AuditSummaryProps) {
  const getBadgeVariant = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'outline';
    return 'destructive';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <Card className="border-border sm:col-span-1 flex flex-col justify-center items-center p-6 text-center">
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block mb-1">Health Score</span>
        <span className={`text-4xl font-black font-mono ${healthScore >= 80 ? 'text-emerald-400' : healthScore >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
          {healthScore} / 100
        </span>
        <Badge variant={getBadgeVariant(healthScore)} className="mt-2 text-[10px]">
          {healthScore >= 80 ? 'Good Condition' : healthScore >= 60 ? 'Needs Attention' : 'Critical Issues'}
        </Badge>
      </Card>

      <Card className="border-border sm:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Audit Results Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-muted/20 border border-border">
            <span className="text-muted-foreground block text-[10px]">Pages Crawled</span>
            <span className="font-mono font-bold text-base text-foreground">{pagesCrawled}</span>
          </div>

          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
            <span className="text-rose-400 block text-[10px]">Errors</span>
            <span className="font-mono font-bold text-base text-rose-400">{errorCount}</span>
          </div>

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <span className="text-amber-400 block text-[10px]">Warnings</span>
            <span className="font-mono font-bold text-base text-amber-400">{warningCount}</span>
          </div>

          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <span className="text-blue-400 block text-[10px]">Notices</span>
            <span className="font-mono font-bold text-base text-blue-400">{noticeCount}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
