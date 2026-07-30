'use client';

import React from 'react';
import { LeadWithCreator, convertLeadToClient, triggerQuickAudit } from '../actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LeadScoreBadge } from './lead-score-badge';
import { Building2, Globe, Mail, Phone, ExternalLink, Sparkles, CheckCircle2, X } from 'lucide-react';
import Link from 'next/link';

interface LeadDetailSlideoutProps {
  lead: LeadWithCreator | null;
  onClose: () => void;
  onRefresh?: () => void;
}

export function LeadDetailSlideout({ lead, onClose, onRefresh }: LeadDetailSlideoutProps) {
  if (!lead) return null;

  const handleConvert = async () => {
    const res = await convertLeadToClient(lead.id);
    if (res.success && onRefresh) onRefresh();
    onClose();
  };

  const handleAudit = async () => {
    const res = await triggerQuickAudit(lead.id);
    if (res.success && onRefresh) onRefresh();
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-card border-l border-border shadow-2xl p-6 flex flex-col space-y-6 animate-in slide-in-from-right duration-200">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground">{lead.companyName}</h2>
            <LeadScoreBadge score={lead.score} />
          </div>
          <p className="text-xs text-muted-foreground">Contact: {lead.contactName}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4 text-xs flex-1 overflow-y-auto">
        <div className="p-3 rounded-xl bg-muted/30 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Pipeline Status</span>
            <Badge variant="outline">{lead.status}</Badge>
          </div>
          {lead.estimatedBudget && (
            <div className="flex items-center justify-between text-[11px] font-medium">
              <span>Est. Budget:</span>
              <span className="text-emerald-400 font-mono">${lead.estimatedBudget.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Contact Info</h4>
          <div className="space-y-1.5 p-3 rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{lead.email}</span>
            </div>
            {lead.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{lead.phone}</span>
              </div>
            )}
            {lead.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                <a href={lead.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  {lead.website}
                </a>
              </div>
            )}
          </div>
        </div>

        {lead.notes && (
          <div className="space-y-1">
            <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Notes</h4>
            <p className="p-3 rounded-lg bg-muted/20 text-muted-foreground">{lead.notes}</p>
          </div>
        )}
      </div>

      <div className="border-t border-border pt-4 space-y-2">
        <Button onClick={handleAudit} className="w-full gap-2 text-xs" variant="secondary">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Run Quick Audit
        </Button>
        <Button onClick={handleConvert} className="w-full gap-2 text-xs">
          <CheckCircle2 className="h-3.5 w-3.5" /> Convert Lead to Active Client
        </Button>
        <Link href={`/dashboard/leads/${lead.id}`} className="block">
          <Button variant="outline" className="w-full text-xs">
            Open Full Detail Page
          </Button>
        </Link>
      </div>
    </div>
  );
}
