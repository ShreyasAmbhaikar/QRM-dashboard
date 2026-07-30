import React from 'react';
import { db } from '@/lib/db';
import { AuditTriggerForm } from '@/features/seo-audit/components/audit-trigger-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, ExternalLink, Globe } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SeoAuditPage() {
  let clients: any[] = [];
  let audits: any[] = [];
  try {
    clients = await db.client.findMany({ orderBy: { name: 'asc' } });
    audits = await db.seoAudit.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { client: true },
    });
  } catch (e) {
    clients = [];
    audits = [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-primary" /> Technical SEO Audits
        </h1>
        <p className="text-xs text-muted-foreground">Playwright Headless Crawler & Health Scoring Engine</p>
      </div>

      <AuditTriggerForm clients={clients} />

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Audit History ({audits.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px]">
                <tr>
                  <th className="p-3">Client Domain</th>
                  <th className="p-3">Health Score</th>
                  <th className="p-3">Pages Crawled</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {audits.map((aud) => (
                  <tr key={aud.id} className="hover:bg-muted/10">
                    <td className="p-3 font-semibold text-foreground flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" /> {aud.client?.name} ({aud.client?.domain})
                    </td>
                    <td className="p-3 font-mono font-bold">
                      <Badge variant={aud.healthScore >= 80 ? 'success' : aud.healthScore >= 60 ? 'outline' : 'destructive'} className="text-[10px]">
                        {aud.healthScore} / 100
                      </Badge>
                    </td>
                    <td className="p-3 font-mono">{aud.pagesCrawled}</td>
                    <td className="p-3 text-muted-foreground">{new Date(aud.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      <Link href={`/dashboard/seo-audit/${aud.id}`} className="text-primary hover:underline inline-flex items-center gap-1">
                        View Audit <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {audits.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-muted-foreground">No SEO audit history recorded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
