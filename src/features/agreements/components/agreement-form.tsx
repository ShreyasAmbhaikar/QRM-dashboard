'use client';

import React, { useState } from 'react';
import { createAgreement } from '../actions';
import { CreateAgreementInput } from '../schemas';
import { DeliverableChecklist } from './deliverable-checklist';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Save, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AgreementStatus } from '@prisma/client';
import Link from 'next/link';

interface AgreementFormProps {
  clients: { id: string; name: string; domain: string }[];
}

export function AgreementForm({ clients }: AgreementFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateAgreementInput>>({
    title: 'SEO Retainer Service Agreement',
    clientId: clients[0]?.id || '',
    monthlyFee: 1500,
    startDate: new Date().toISOString().split('T')[0],
    endDate: undefined,
    status: AgreementStatus.DRAFT,
    content: 'Master SEO Services Scope & Terms for local position optimization and Google Business Profile management.',
    deliverables: [
      '4 Google Business Profile updates per month',
      'Continuous local keyword rank tracking',
      'Monthly technical SEO audit and issue resolution',
      'Competitor gap monitoring & report digest',
    ],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.clientId || !formData.monthlyFee || !formData.startDate) return;

    setLoading(true);
    try {
      const res = await createAgreement({
        title: formData.title,
        clientId: formData.clientId,
        monthlyFee: Number(formData.monthlyFee),
        startDate: formData.startDate.toString(),
        endDate: formData.endDate ? formData.endDate.toString() : undefined,
        status: formData.status || AgreementStatus.DRAFT,
        content: formData.content || 'Default Agreement Terms',
        deliverables: formData.deliverables || [],
      });

      if (res.success) {
        router.push(`/dashboard/agreements/${res.data.id}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/agreements">
            <Button type="button" variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold tracking-tight">Create Service Agreement</h1>
        </div>
        <Button type="submit" disabled={loading} className="gap-2 shadow">
          <Save className="h-4 w-4" /> {loading ? 'Saving...' : 'Create & Generate Contract'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> Agreement Details
          </CardTitle>
          <CardDescription>Select client and set financial terms</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">Contract Title *</label>
            <Input
              required
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="h-8 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">Target Client *</label>
              <select
                className="w-full h-8 rounded-md border border-input bg-background px-3 py-1 text-xs"
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.domain})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">Monthly Fee ($ USD) *</label>
              <Input
                required
                type="number"
                value={formData.monthlyFee || ''}
                onChange={(e) => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">Start Date *</label>
              <Input
                required
                type="date"
                value={formData.startDate ? formData.startDate.toString() : ''}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">End Date (Optional)</label>
              <Input
                type="date"
                value={formData.endDate ? formData.endDate.toString() : ''}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border space-y-2">
            <label className="text-[11px] font-medium text-muted-foreground block">
              Included Deliverables Checklist
            </label>
            <DeliverableChecklist
              items={formData.deliverables || []}
              onChange={(items) => setFormData({ ...formData, deliverables: items })}
            />
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
