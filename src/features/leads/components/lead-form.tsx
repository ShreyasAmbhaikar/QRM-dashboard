'use client';

import React, { useState } from 'react';
import { createLead, calculateLeadScore } from '../actions';
import { CreateLeadInput } from '../schemas';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LeadStatus } from '@prisma/client';
import { Building2, Mail, User, Phone, Globe, DollarSign, Sparkles } from 'lucide-react';

interface LeadFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function LeadFormDialog({ open, onOpenChange, onSuccess }: LeadFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateLeadInput>>({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    estimatedBudget: undefined,
    status: LeadStatus.NEW,
    notes: '',
  });

  const [predictedScore, setPredictedScore] = useState<number>(30);

  const handleChange = async (field: keyof CreateLeadInput, value: any) => {
    const next = { ...formData, [field]: value };
    setFormData(next);
    const score = await calculateLeadScore(next);
    setPredictedScore(score);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.contactName || !formData.email) return;

    setLoading(true);
    try {
      const res = await createLead({
        companyName: formData.companyName,
        contactName: formData.contactName,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        estimatedBudget: formData.estimatedBudget ? Number(formData.estimatedBudget) : undefined,
        status: formData.status || LeadStatus.NEW,
        notes: formData.notes,
      });

      if (res.success) {
        onOpenChange(false);
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
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> Create New CRM Lead
            </DialogTitle>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <Sparkles className="h-3 w-3" /> Score: {predictedScore}/100
            </div>
          </div>
          <DialogDescription className="text-xs">
            Enter lead info to calculate automated priority score and add to pipeline.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 py-2 text-xs">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">Company Name *</label>
            <Input
              required
              placeholder="Acme Plumbing Co."
              value={formData.companyName || ''}
              onChange={(e) => handleChange('companyName', e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">Contact Name *</label>
              <Input
                required
                placeholder="John Doe"
                value={formData.contactName || ''}
                onChange={(e) => handleChange('contactName', e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">Email Address *</label>
              <Input
                required
                type="email"
                placeholder="john@acme.com"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">Website URL</label>
              <Input
                placeholder="https://acmeplumbing.com"
                value={formData.website || ''}
                onChange={(e) => handleChange('website', e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">Est. Monthly Budget ($)</label>
              <Input
                type="number"
                placeholder="2500"
                value={formData.estimatedBudget || ''}
                onChange={(e) => handleChange('estimatedBudget', e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">Phone Number</label>
            <Input
              placeholder="(555) 000-0000"
              value={formData.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? 'Creating...' : 'Save Lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
