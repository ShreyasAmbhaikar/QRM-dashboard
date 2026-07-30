'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertOctagon, CheckCircle2, ExternalLink } from 'lucide-react';
import { Backlink } from '@prisma/client';

interface BacklinkTableProps {
  backlinks: Backlink[];
}

export function BacklinkTable({ backlinks }: BacklinkTableProps) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <table className="w-full text-left text-xs">
        <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px]">
          <tr>
            <th className="p-3">Referring Domain</th>
            <th className="p-3">Target URL</th>
            <th className="p-3">Anchor Text</th>
            <th className="p-3">Domain Auth (DA)</th>
            <th className="p-3">Toxic Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {backlinks.map((link) => (
            <tr key={link.id} className="hover:bg-muted/10">
              <td className="p-3 font-semibold text-foreground flex items-center gap-1.5">
                {link.referringDomain}
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </td>
              <td className="p-3 font-mono text-muted-foreground truncate max-w-xs">{link.targetUrl}</td>
              <td className="p-3 text-muted-foreground">{link.anchorText || '—'}</td>
              <td className="p-3 font-mono font-bold text-primary">{link.domainAuthority}</td>
              <td className="p-3">
                {link.isToxic ? (
                  <Badge variant="destructive" className="text-[10px]">
                    <AlertOctagon className="h-3 w-3 mr-1" /> Toxic Link
                  </Badge>
                ) : (
                  <Badge variant="success" className="text-[10px]">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Clean
                  </Badge>
                )}
              </td>
            </tr>
          ))}
          {backlinks.length === 0 && (
            <tr>
              <td colSpan={5} className="p-6 text-center text-muted-foreground">No backlink records found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
