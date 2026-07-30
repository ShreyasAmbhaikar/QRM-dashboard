'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface PageAnalysisTableProps {
  pages: any[];
}

export function PageAnalysisTable({ pages }: PageAnalysisTableProps) {
  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Crawled Page Analysis ({pages.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px]">
              <tr>
                <th className="p-3">Page URL</th>
                <th className="p-3">Status</th>
                <th className="p-3">Title Tag</th>
                <th className="p-3">H1 Heading</th>
                <th className="p-3">Schema</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pages.map((p, idx) => (
                <tr key={idx} className="hover:bg-muted/10">
                  <td className="p-3 font-mono font-medium text-foreground truncate max-w-xs">{p.url}</td>
                  <td className="p-3 font-mono">
                    <Badge variant={p.statusCode === 200 ? 'success' : 'destructive'} className="text-[10px]">
                      {p.statusCode}
                    </Badge>
                  </td>
                  <td className="p-3 text-muted-foreground truncate max-w-xs">{p.meta?.title || <span className="text-rose-400 font-bold">Missing</span>}</td>
                  <td className="p-3 text-muted-foreground truncate max-w-xs">{p.headings?.h1?.[0] || <span className="text-rose-400 font-bold">Missing</span>}</td>
                  <td className="p-3">
                    <Badge variant={p.schema?.hasJsonLd ? 'outline' : 'secondary'} className="text-[10px]">
                      {p.schema?.hasJsonLd ? 'Valid' : 'None'}
                    </Badge>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground">No page crawl data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
