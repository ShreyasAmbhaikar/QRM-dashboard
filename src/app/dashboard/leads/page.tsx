'use client';

import React, { useState, useEffect } from 'react';
import { getLeads, updateLeadStatus, LeadWithCreator } from '@/features/leads/actions';
import { LeadKanban } from '@/features/leads/components/lead-kanban';
import { LeadList } from '@/features/leads/components/lead-list';
import { LeadFormDialog } from '@/features/leads/components/lead-form';
import { LeadDetailSlideout } from '@/features/leads/components/lead-detail-slideout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LeadStatus } from '@prisma/client';
import { Plus, LayoutGrid, List, Search, Filter } from 'lucide-react';

export default function LeadsPage() {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [leads, setLeads] = useState<LeadWithCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadWithCreator | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    const res = await getLeads({ search });
    if (res.success) {
      setLeads(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, [search]);

  const handleStatusChange = async (leadId: string, status: LeadStatus) => {
    await updateLeadStatus(leadId, status);
    fetchLeads();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lead CRM & Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            Qualify leads, score opportunities, trigger instant audits, and convert to active clients.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-border p-1 bg-card">
            <Button
              variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-2.5 text-xs gap-1.5"
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Kanban
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-2.5 text-xs gap-1.5"
              onClick={() => setViewMode('list')}
            >
              <List className="h-3.5 w-3.5" /> List
            </Button>
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="gap-2 shadow-lg">
            <Plus className="h-4 w-4" /> Create Lead
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads by company, contact, or email..."
            className="pl-9 h-9 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="h-96 rounded-xl bg-muted animate-pulse" />
      ) : viewMode === 'kanban' ? (
        <LeadKanban leads={leads} onStatusChange={handleStatusChange} />
      ) : (
        <LeadList leads={leads} onSelectLead={(lead) => setSelectedLead(lead)} />
      )}

      <LeadFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} onSuccess={fetchLeads} />
      <LeadDetailSlideout lead={selectedLead} onClose={() => setSelectedLead(null)} onRefresh={fetchLeads} />
    </div>
  );
}
