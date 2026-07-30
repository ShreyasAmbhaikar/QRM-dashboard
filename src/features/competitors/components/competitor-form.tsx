'use client';

import React, { useState } from 'react';
import { addCompetitor } from '../actions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, Plus } from 'lucide-react';

interface CompetitorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: { id: string; name: string }[];
  onSuccess?: () => void;
}

export function CompetitorFormDialog({ open, onOpenChange, clients, onSuccess }: CompetitorFormProps) {
  const [loading, setLoading] = useState(false);
  const [domain, setDomain] = useState('');
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [da, setDa] = useState(45);
  const [traffic, setTraffic] = useState(12000);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim() || !clientId) return;

    setLoading(true);
    try {
      const res = await addCompetitor({
        domain: domain.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, ''),
        clientId,
        domainAuthority: Number(da),
        organicKeywords: 1500,
        backlinks: 4500,
      });

      if (res.success) {
        onOpenChange(false);
        setDomain('');
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
            <Globe className="h-4 w-4 text-primary" /> Track Competitor Domain
          </DialogTitle>
          <DialogDescription className="text-xs">
            Add rival website domain to track Share of Voice and keyword overlap.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 py-2 text-xs">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">Competitor Domain *</label>
            <Input
              required
              placeholder="competitorplumbing.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">Target Client *</label>
            <select
              className="w-full h-8 rounded-md border border-input bg-background px-3 py-1 text-xs"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">Domain Authority (DA)</label>
              <Input
                type="number"
                value={da}
                onChange={(e) => setDa(Number(e.target.value))}
                className="h-8 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">Est. Monthly Traffic</label>
              <Input
                type="number"
                value={traffic}
                onChange={(e) => setTraffic(Number(e.target.value))}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? 'Adding...' : 'Add Competitor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
