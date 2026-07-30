'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

interface BulkImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport?: (keywords: string[]) => void;
}

export function BulkImportModal({ open, onOpenChange, onImport }: BulkImportModalProps) {
  const [text, setText] = useState('');
  const [importedCount, setImportedCount] = useState<number | null>(null);

  const handleProcess = () => {
    const list = text
      .split('\n')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    setImportedCount(list.length);
    if (onImport) onImport(list);
    setTimeout(() => {
      setImportedCount(null);
      setText('');
      onOpenChange(false);
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-primary" /> Bulk CSV / Keyword Import
          </DialogTitle>
          <DialogDescription className="text-xs">
            Paste a list of keywords (one per line) or CSV content to add to rank tracker.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <textarea
            rows={8}
            placeholder="plumber chicago&#10;emergency drain cleaning&#10;24/7 plumbing service"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full rounded-md border border-input bg-background p-3 text-xs font-mono"
          />

          {importedCount !== null && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Successfully imported {importedCount} keywords into queue!</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleProcess} disabled={!text.trim()} className="gap-2">
            <Upload className="h-3.5 w-3.5" /> Start Bulk Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
