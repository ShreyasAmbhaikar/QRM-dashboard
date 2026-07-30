'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { calculateGbpCompletenessScore, ProfileData } from '../scoring';

interface GbpScoreBreakdownProps {
  profile: ProfileData;
}

export function GbpScoreBreakdown({ profile }: GbpScoreBreakdownProps) {
  const { totalScore, breakdown } = calculateGbpCompletenessScore(profile);

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-1">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Profile Audit & Completeness
          </CardTitle>
        </div>
        <Badge
          variant={totalScore >= 80 ? 'success' : 'outline'}
          className="font-mono text-base px-3 py-1 font-bold"
        >
          {totalScore} / 100
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {breakdown.map((item, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-lg border flex items-center justify-between ${
                item.completed
                  ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
                  : 'border-border bg-muted/20 text-muted-foreground'
              }`}
            >
              <span className="flex items-center gap-2">
                {item.completed ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                )}
                <span>{item.item}</span>
              </span>
              <span className="font-mono text-[10px] font-bold">+{item.points} pt</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
