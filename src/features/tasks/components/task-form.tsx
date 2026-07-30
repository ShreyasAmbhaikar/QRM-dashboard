'use client';

import React, { useState } from 'react';
import { createTask } from '../actions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckSquare, Calendar, User, Building } from 'lucide-react';

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: { id: string; name: string }[];
  onSuccess?: () => void;
}

export function TaskFormDialog({ open, onOpenChange, clients, onSuccess }: TaskFormProps) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [clientId, setClientId] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const res = await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status: 'TODO',
        clientId: clientId || undefined,
        dueDate: dueDate || undefined,
      });

      if (res.success) {
        onOpenChange(false);
        setTitle('');
        setDescription('');
        if (onSuccess) onSuccess();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-primary" /> Create Agency Action Item
          </DialogTitle>
          <DialogDescription className="text-xs">
            Assign SEO task deliverables to team members or link to client retainer deliverables.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 py-2 text-xs">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">Task Title *</label>
            <Input
              required
              placeholder="e.g. Audit Google Business Profile photos..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">Description / Guidelines</label>
            <textarea
              rows={3}
              placeholder="Add task instructions or checklist items..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-input bg-background p-2 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">Priority Level</label>
              <select
                className="w-full h-8 rounded-md border border-input bg-background px-3 py-1 text-xs"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">Due Date</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">Link Client (Optional)</label>
            <select
              className="w-full h-8 rounded-md border border-input bg-background px-3 py-1 text-xs"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            >
              <option value="">None (Internal Agency Task)</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? 'Creating...' : 'Save Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
