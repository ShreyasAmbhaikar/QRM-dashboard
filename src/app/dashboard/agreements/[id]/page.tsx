import React from 'react';
import { getAgreementById } from '@/features/agreements/actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Download, Send, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function AgreementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const response = await getAgreementById(id);

  if (!response.success || !response.data) {
    notFound();
  }

  const agreement = response.data;
  const deliverables = Array.isArray(agreement.deliverables) ? (agreement.deliverables as string[]) : [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/agreements">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">{agreement.title}</h1>
          <p className="text-xs text-muted-foreground">Client: {agreement.client.name} ({agreement.client.domain})</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Badge variant={agreement.status === 'SIGNED' ? 'success' : 'outline'}>
            {agreement.status}
          </Badge>
          <Button size="sm" className="gap-2 shadow">
            <Send className="h-3.5 w-3.5" /> Send to Client
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Service Retainer Agreement
            </CardTitle>
            <CardDescription>Monthly Retainer: ${agreement.monthlyFee.toLocaleString()}/mo</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <Download className="h-3.5 w-3.5" /> Download PDF
          </Button>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="p-6 rounded-xl border border-border bg-card text-xs leading-relaxed text-foreground space-y-3">
            <h3 className="font-bold text-sm text-primary">Master Services Scope & Terms</h3>
            <p className="text-muted-foreground">
              This agreement establishes the monthly digital marketing, local SEO, and search position optimization services provided to {agreement.client.name}.
            </p>
          </div>

          {deliverables.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                Monthly Included Deliverables
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {deliverables.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg border border-border bg-muted/20 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
