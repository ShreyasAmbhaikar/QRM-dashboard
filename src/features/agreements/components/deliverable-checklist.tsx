'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface DeliverableChecklistProps {
  items: string[];
  onChange: (items: string[]) => void;
}

export function DeliverableChecklist({ items, onChange }: DeliverableChecklistProps) {
  const [newItem, setNewItem] = useState('');

  const handleAdd = () => {
    if (!newItem.trim()) return;
    onChange([...items, newItem.trim()]);
    setNewItem('');
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Add deliverable item (e.g. 4 Google Business Posts/month)..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          className="h-8 text-xs"
        />
        <Button type="button" size="sm" onClick={handleAdd} className="gap-1 text-xs shrink-0">
          <Plus className="h-3.5 w-3.5" /> Add
        </Button>
      </div>

      <div className="space-y-1.5">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 rounded-lg border border-border bg-card text-xs"
          >
            <span className="flex items-center gap-2 text-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              {item}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
              onClick={() => handleRemove(index)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-[11px] text-muted-foreground text-center py-3 border border-dashed border-border rounded-lg">
            No deliverables added yet.
          </p>
        )}
      </div>
    </div>
  );
}
