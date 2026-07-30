import React from 'react';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { AuditSummary } from '@/features/seo-audit/components/audit-summary';
import { IssueBreakdown } from '@/features/seo-audit/components/issue-breakdown';
import { PageAnalysisTable } from '@/features/seo-audit/components/page-analysis-table';
import { CwvScores } from '@/features/seo-audit/components/cwv-scores';
import { ScreenshotGallery } from '@/features/seo-audit/components/screenshot-gallery';
import { ArrowLeft, Download, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

interface SeoAuditDetailProps {
  params: Promise<{ id: string }>;
}

export default async function SeoAuditDetail({ params }: SeoAuditDetailProps) {
  const { id } = await params;

  let audit: any = null;
  try {
    audit = await db.seoAudit.findUnique({
      where: { id },
      include: { client: true },
    });
  } catch (e) {
    audit = null;
  }

  if (!audit) notFound();

  let issues: any[] = [];
  let cwv: any = { lcp: '1.8s', cls: '0.04', inp: '110ms', performanceScore: 92 };

  try {
    issues = typeof audit.issuesFound === 'string' ? JSON.parse(audit.issuesFound) : audit.issuesFound || [];
    cwv = typeof audit.coreWebVitals === 'string' ? JSON.parse(audit.coreWebVitals) : audit.coreWebVitals || cwv;
  } catch (e) {}

  const errors = issues.filter((i: any) => i.severity === 'ERROR').length;
  const warnings = issues.filter((i: any) => i.severity === 'WARNING').length;
  const notices = issues.filter((i: any) => i.severity === 'NOTICE').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/seo-audit">
            <div className="p-2 rounded-lg border border-border hover:bg-card">
              <ArrowLeft className="h-4 w-4" />
            </div>
          </Link>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" /> Audit Details — {audit.client?.name}
            </h1>
            <p className="text-xs text-muted-foreground">{audit.client?.domain} — {new Date(audit.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Download className="h-3.5 w-3.5" /> Download Branded Audit PDF
        </Button>
      </div>

      <AuditSummary
        healthScore={audit.healthScore}
        pagesCrawled={audit.pagesCrawled}
        errorCount={errors}
        warningCount={warnings}
        noticeCount={notices}
      />

      <CwvScores cwv={cwv} />

      <IssueBreakdown issues={issues} />

      <ScreenshotGallery />

      <PageAnalysisTable pages={[]} />
    </div>
  );
}
