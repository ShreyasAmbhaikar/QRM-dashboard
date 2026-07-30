import React from 'react';
import { getLeadById } from '@/features/leads/actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, Globe, Mail, Phone, ExternalLink, FileText } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LeadScoreBadge } from '@/features/leads/components/lead-score-badge';

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const response = await getLeadById(id);

  if (!response.success || !response.data) {
    notFound();
  }

  const lead = response.data;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/leads">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">{lead.companyName}</h1>
          <p className="text-xs text-muted-foreground">Contact: {lead.contactName}</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <LeadScoreBadge score={lead.score} />
          <Badge variant="outline">{lead.status}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Lead Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground block text-[10px]">Email</span>
                <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" /> {lead.email}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Phone</span>
                <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" /> {lead.phone || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Website</span>
                <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" /> {lead.website || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Est. Budget</span>
                <span className="font-medium text-emerald-400 font-mono text-sm mt-0.5 block">
                  ${lead.estimatedBudget ? lead.estimatedBudget.toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>

            {lead.notes && (
              <div className="pt-4 border-t border-border">
                <span className="text-muted-foreground block text-[10px] mb-1">Notes</span>
                <p className="p-3 rounded-lg bg-muted/30 text-muted-foreground">{lead.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full gap-2 text-xs">
              <FileText className="h-3.5 w-3.5" /> Trigger Quick Audit
            </Button>
            <Button variant="outline" className="w-full gap-2 text-xs">
              <Building2 className="h-3.5 w-3.5" /> Convert to Client
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
