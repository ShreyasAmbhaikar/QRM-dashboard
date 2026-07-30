'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { AuditIssue } from '@/workers/crawler/types';
import { IssueDetailModal } from './issue-detail-modal';

interface IssueBreakdownProps {
  issues: AuditIssue[];
}

export function IssueBreakdown({ issues }: IssueBreakdownProps) {
  const [selectedIssue, setSelectedIssue] = useState<AuditIssue | null>(null);

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'ERROR':
        return <Badge variant="destructive" className="text-[10px]"><AlertCircle className="h-3 w-3 mr-1" /> Error</Badge>;
      case 'WARNING':
        return <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30 bg-amber-500/10"><AlertTriangle className="h-3 w-3 mr-1" /> Warning</Badge>;
      default:
        return <Badge variant="secondary" className="text-[10px] text-blue-400"><Info className="h-3 w-3 mr-1" /> Notice</Badge>;
    }
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Categorized Audit Issues ({issues.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        {issues.map((issue) => (
          <div
            key={issue.id}
            onClick={() => setSelectedIssue(issue)}
            className="p-3.5 rounded-xl border border-border bg-card/40 hover:bg-card hover:border-primary/50 transition-all cursor-pointer flex items-start justify-between"
          >
            <div className="space-y-1 pr-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{issue.title}</span>
                {getSeverityBadge(issue.severity)}
              </div>
              <p className="text-muted-foreground line-clamp-1">{issue.description}</p>
            </div>

            <Badge variant="outline" className="text-[10px] font-mono shrink-0">
              {issue.affectedPagesCount} Affected Page{issue.affectedPagesCount > 1 ? 's' : ''}
            </Badge>
          </div>
        ))}
        {issues.length === 0 && (
          <p className="text-muted-foreground text-center py-6">No technical issues detected!</p>
        )}
      </CardContent>

      {selectedIssue && (
        <IssueDetailModal issue={selectedIssue} onClose={() => setSelectedIssue(null)} />
      )}
    </Card>
  );
}
