'use client';

import React from 'react';
import { LeadCard } from './lead-card';
import { Lead, LeadStatus } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface LeadKanbanProps {
  leads: Lead[];
  onStatusChange?: (leadId: string, newStatus: LeadStatus) => void;
  onConvert?: (leadId: string) => void;
}

const COLUMNS: { label: string; status: LeadStatus; color: string }[] = [
  { label: 'New Lead', status: LeadStatus.NEW, color: 'border-blue-500/30 bg-blue-500/5' },
  { label: 'Contacted', status: LeadStatus.CONTACTED, color: 'border-indigo-500/30 bg-indigo-500/5' },
  { label: 'Audit Sent', status: LeadStatus.AUDIT_SENT, color: 'border-amber-500/30 bg-amber-500/5' },
  { label: 'Proposal', status: LeadStatus.PROPOSAL, color: 'border-purple-500/30 bg-purple-500/5' },
  { label: 'Won', status: LeadStatus.WON, color: 'border-emerald-500/30 bg-emerald-500/5' },
];

export function LeadKanban({ leads }: LeadKanbanProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const colLeads = leads.filter((l) => l.status === col.status);
        return (
          <div key={col.status} className={`p-3 rounded-xl border ${col.color} space-y-3 min-w-[240px]`}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider">
                {col.label}
              </h3>
              <Badge variant="secondary" className="text-[10px] font-bold">
                {colLeads.length}
              </Badge>
            </div>

            <SortableContext items={colLeads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3 min-h-[150px]">
                {colLeads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}

                {colLeads.length === 0 && (
                  <div className="p-4 text-center border border-dashed border-border rounded-lg text-muted-foreground text-[11px]">
                    No leads
                  </div>
                )}
              </div>
            </SortableContext>
          </div>
        );
      })}
    </div>
  );
}
