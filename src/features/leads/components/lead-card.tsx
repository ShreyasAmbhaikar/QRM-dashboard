'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Lead } from '@prisma/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LeadScoreBadge } from './lead-score-badge';
import { Building2, Globe, Phone, Mail, GripVertical } from 'lucide-react';
import Link from 'next/link';

interface LeadCardProps {
  lead: Lead;
}

export function LeadCard({ lead }: LeadCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card className="border-border bg-card/60 hover:border-primary/50 transition-all shadow-sm group">
        <CardHeader className="p-3 pb-2 space-y-1">
          <div className="flex items-center justify-between">
            <LeadScoreBadge score={lead.score} />
            <button
              {...listeners}
              className="text-muted-foreground/40 hover:text-foreground cursor-grab active:cursor-grabbing p-1"
            >
              <GripVertical className="h-3.5 w-3.5" />
            </button>
          </div>
          <Link href={`/dashboard/leads/${lead.id}`}>
            <CardTitle className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">{lead.companyName}</span>
            </CardTitle>
          </Link>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 truncate">
            <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="truncate">{lead.email}</span>
          </div>

          {lead.website && (
            <div className="flex items-center gap-1.5 truncate">
              <Globe className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="truncate">{lead.website}</span>
            </div>
          )}

          {lead.estimatedBudget && (
            <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] font-medium text-foreground">
              <span>Est. Budget:</span>
              <span className="text-emerald-400 font-mono">${lead.estimatedBudget.toLocaleString()}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
