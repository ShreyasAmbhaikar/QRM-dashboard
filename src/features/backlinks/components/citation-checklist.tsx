'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { CitationListing } from '@prisma/client';
import { NapComparisonModal } from './nap-comparison-modal';

interface CitationChecklistProps {
  citations: CitationListing[];
}

export function CitationChecklist({ citations }: CitationChecklistProps) {
  const targetNap = {
    name: 'Quantum Reach Media',
    address: '123 SEO Boulevard, Suite 100, Austin, TX 78701',
    phone: '(512) 555-0199',
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Local Citation & Directory Consistency ({citations.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px]">
              <tr>
                <th className="p-3">Directory</th>
                <th className="p-3">Name Match</th>
                <th className="p-3">Address Match</th>
                <th className="p-3">Phone Match</th>
                <th className="p-3">Consistency Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {citations.map((cit) => (
                <tr key={cit.id} className="hover:bg-muted/10">
                  <td className="p-3 font-semibold text-foreground flex items-center gap-1.5">
                    {cit.directoryName}
                    {cit.listingUrl && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
                  </td>
                  <td className="p-3 font-mono">{cit.nameMatch ? '✅' : '❌'}</td>
                  <td className="p-3 font-mono">{cit.addressMatch ? '✅' : '❌'}</td>
                  <td className="p-3 font-mono">{cit.phoneMatch ? '✅' : '❌'}</td>
                  <td className="p-3">
                    <Badge variant={cit.status === 'CONSISTENT' ? 'success' : 'destructive'} className="text-[10px]">
                      {cit.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <NapComparisonModal citation={cit} targetNap={targetNap} />
                  </td>
                </tr>
              ))}
              {citations.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground">No citation audit records.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
