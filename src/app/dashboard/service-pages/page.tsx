import React from 'react';
import { db } from '@/lib/db';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, MapPin, Code2, Plus } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ServicePagesOverviewPage() {
  let pages: any[] = [];
  try {
    pages = await db.servicePage.findMany({
      include: { client: true },
      orderBy: { createdAt: 'desc' },
    });
  } catch (e) {
    pages = [];
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Service Pages & JSON-LD Generator</h1>
          <p className="text-sm text-muted-foreground">
            Generate 1,200+ word localized SEO landing pages with structured Schema.org JSON-LD markup.
          </p>
        </div>
        <Button className="gap-2 text-xs">
          <Plus className="h-4 w-4" /> Generate New Service Page
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page) => (
          <Card key={page.id} className="border-border hover:border-primary/50 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-1">
                <Badge variant="outline" className="text-[10px] font-mono">{page.client.name}</Badge>
                <Badge variant="success" className="text-[10px]">Ready</Badge>
              </div>
              <CardTitle className="text-base flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-primary" /> {page.serviceName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-rose-400" /> {page.targetCity}</span>
                <span className="flex items-center gap-1"><Code2 className="h-3.5 w-3.5 text-blue-400" /> Schema OK</span>
              </div>
              <p className="text-muted-foreground line-clamp-2">{page.htmlContent}</p>
            </CardContent>
          </Card>
        ))}

        {pages.length === 0 && (
          <div className="col-span-full p-12 text-center border border-dashed border-border rounded-xl">
            <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-xs">No localized service pages generated yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
