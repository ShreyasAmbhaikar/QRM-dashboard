'use client';

import React from 'react';
import { LeadWithCreator } from '../actions';
import { LeadScoreBadge } from './lead-score-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Globe, Mail, Phone, ExternalLink, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface LeadListProps {
  leads: LeadWithCreator[];
  onSelectLead: (lead: LeadWithCreator) => void;
}

export function LeadList({ leads, onSelectLead }: LeadListProps) {
  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase tracking-wider font-semibold text-[10px]">
            <tr>
              <th className="px-4 py-3">Lead / Company</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Est. Budget</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className="hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => onSelectLead(lead)}
              >
                <td className="px-4 py-3">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    {lead.companyName}
                  </div>
                  {lead.website && (
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Globe className="h-3 w-3" />
                      {lead.website}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{lead.contactName}</div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Mail className="h-3 w-3" />
                    {lead.email}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <LeadScoreBadge score={lead.score} />
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="text-[10px]">
                    {lead.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 font-mono text-emerald-400 font-semibold">
                  {lead.estimatedBudget ? `$${lead.estimatedBudget.toLocaleString()}` : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/dashboard/leads/${lead.id}`} onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}

            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-xs">
                  No leads found matching current filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
