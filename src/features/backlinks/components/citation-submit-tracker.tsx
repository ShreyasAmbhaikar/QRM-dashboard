'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, ClipboardList } from 'lucide-react';

interface SubmissionItem {
  directory: string;
  submitted: boolean;
  notes: string;
}

export function CitationSubmitTracker() {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([
    { directory: 'Yelp', submitted: true, notes: 'Auto-synced' },
    { directory: 'Bing Places', submitted: true, notes: 'Verified via Bing Webmaster' },
    { directory: 'Apple Maps', submitted: false, notes: 'Requires Apple Business Connect account' },
    { directory: 'Yellow Pages', submitted: false, notes: 'Pending verification call' },
    { directory: 'BBB', submitted: false, notes: 'Paid membership required for full verification' },
  ]);

  const toggleSubmitted = (index: number) => {
    const updated = [...submissions];
    const item = updated[index];
    if (item) {
      item.submitted = !item.submitted;
      setSubmissions(updated);
    }
  };

  return (
    <Card className="border-border text-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-primary" /> Directory Submission Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-[10px] text-muted-foreground leading-normal">
          Keep track of manual citation builds and optimization status across secondary local business directories.
        </p>

        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
          {submissions.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between p-2 rounded-xl border transition-all duration-200 ${item.submitted ? 'bg-muted/10 border-border/50 opacity-80' : 'bg-background border-border hover:border-primary/30'}`}
            >
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => toggleSubmitted(idx)}
                  className={`h-4 w-4 rounded border flex items-center justify-center transition-all duration-150 ${item.submitted ? 'bg-primary border-primary text-primary-foreground' : 'border-input hover:border-primary'}`}
                >
                  {item.submitted && <Check className="h-3 w-3" />}
                </button>
                <div>
                  <span className="font-semibold text-foreground">{item.directory}</span>
                  <span className="text-[10px] text-muted-foreground block">{item.notes}</span>
                </div>
              </div>
              <Badge variant={item.submitted ? 'success' : 'secondary'} className="text-[9px] uppercase font-semibold">
                {item.submitted ? 'Submitted' : 'Pending'}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
