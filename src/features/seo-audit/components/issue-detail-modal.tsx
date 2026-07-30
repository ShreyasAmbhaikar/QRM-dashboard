'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, CheckCircle2, Wrench } from 'lucide-react';
import { AuditIssue } from '@/workers/crawler/types';

interface IssueDetailModalProps {
  issue: AuditIssue;
  onClose: () => void;
}

export function IssueDetailModal({ issue, onClose }: IssueDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="border-border max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-muted text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" /> {issue.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 text-xs">
          <div className="space-y-1">
            <span className="text-muted-foreground font-medium block">Issue Overview</span>
            <p className="text-foreground leading-relaxed">{issue.description}</p>
          </div>

          <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 space-y-1">
            <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Recommended Action & Fix
            </span>
            <p className="text-muted-foreground leading-relaxed">{issue.recommendation}</p>
          </div>

          <Button variant="secondary" className="w-full text-xs" onClick={onClose}>
            Close
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
