'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AgreementWithClient } from '../actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { 
  Plus, 
  Search, 
  FileText, 
  Download, 
  Copy, 
  Check, 
  Eye, 
  Calendar,
  Building2,
  DollarSign
} from 'lucide-react';

interface AgreementListProps {
  initialAgreements: AgreementWithClient[];
}

export function AgreementList({ initialAgreements }: AgreementListProps) {
  const [agreements] = useState<AgreementWithClient[]>(initialAgreements);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { success: toastSuccess } = useToast();

  const handleCopyLink = async (id: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/agreements/sign/${id}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedId(id);
      toastSuccess('Copied!', 'Client signing link copied to clipboard.');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const filteredAgreements = agreements.filter((agreement) => {
    const query = searchQuery.toLowerCase();
    return (
      agreement.title.toLowerCase().includes(query) ||
      agreement.client.name.toLowerCase().includes(query) ||
      (agreement.client.domain && agreement.client.domain.toLowerCase().includes(query))
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SIGNED':
        return <Badge variant="success">SIGNED</Badge>;
      case 'SENT':
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none">SENT</Badge>;
      case 'DRAFT':
      default:
        return <Badge variant="secondary">DRAFT</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Service Agreements</h1>
          <p className="text-sm text-muted-foreground">
            Create, manage, track client signing status, and download PDF agreements.
          </p>
        </div>
        <Link href="/dashboard/agreements/new">
          <Button className="gap-2 shadow-lg bg-primary hover:bg-primary/90 text-white font-semibold cursor-pointer">
            <Plus className="h-4 w-4" /> Create Agreement
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or client name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card border-border text-xs"
          />
        </div>
      </div>

      {/* Agreements List Grid/Table */}
      <Card className="border-border bg-card overflow-hidden rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Agreement Info</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Client details</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monthly Fee</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Start Date</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredAgreements.map((agreement) => (
                <tr key={agreement.id} className="hover:bg-muted/10 transition-colors group">
                  {/* Agreement Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 group-hover:scale-105 transition-transform shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <Link 
                          href={`/dashboard/agreements/${agreement.id}`}
                          className="font-semibold text-xs hover:underline group-hover:text-primary transition-colors text-foreground"
                        >
                          {agreement.title}
                        </Link>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          Last updated: {new Date(agreement.updatedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Client Details */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <div className="text-xs font-semibold text-foreground">{agreement.client.name}</div>
                    </div>
                    {agreement.client.domain && (
                      <div className="text-[10px] text-muted-foreground pl-5 mt-0.5">{agreement.client.domain}</div>
                    )}
                  </td>

                  {/* Monthly Fee */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-xs font-semibold text-foreground">
                      <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                      {Number(agreement.monthlyFee).toLocaleString()} /mo
                    </div>
                  </td>

                  {/* Start Date */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-foreground">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span>
                        {new Date(agreement.startDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="px-6 py-4">
                    {getStatusBadge(agreement.status)}
                  </td>

                  {/* Action Buttons */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
                      <Link href={`/dashboard/agreements/${agreement.id}`}>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer"
                          title="View & Edit"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>

                      <Link href={`/api/agreements/${agreement.id}/pdf`} target="_blank">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer"
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </Link>

                      <Button
                        onClick={() => handleCopyLink(agreement.id)}
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer"
                        title="Copy Public Sign Link"
                      >
                        {copiedId === agreement.id ? (
                          <Check className="h-4 w-4 text-emerald-500 animate-in zoom-in duration-200" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredAgreements.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs text-muted-foreground bg-muted/5">
                    No agreements found. Click "Create Agreement" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
