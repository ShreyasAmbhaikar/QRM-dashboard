'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Repeat, Calendar, CheckCircle2 } from 'lucide-react';

interface RecurringTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecurringTaskModal({ open, onOpenChange }: RecurringTaskModalProps) {
  const [frequency, setFrequency] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('WEEKLY');
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSave = () => {
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <Repeat className="h-4 w-4 text-primary" /> Recurring Task Schedule
          </DialogTitle>
          <DialogDescription className="text-xs">
            Auto-generate recurring SEO deliverables on a standing schedule.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">Recurrence Frequency</label>
            <select
              className="w-full h-8 rounded-md border border-input bg-background px-3 py-1 text-xs"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as any)}
            >
              <option value="DAILY">Every Day (09:00 AM)</option>
              <option value="WEEKLY">Every Monday (09:00 AM)</option>
              <option value="MONTHLY">1st Day of Every Month</option>
            </select>
          </div>

          {successMsg && (
            <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Recurrence rule saved successfully!</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            Save Rule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
