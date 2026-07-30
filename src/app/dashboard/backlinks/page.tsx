import React from 'react';
import { db } from '@/lib/db';
import { BacklinkSummary } from '@/features/backlinks/components/backlink-summary';
import { BacklinkTable } from '@/features/backlinks/components/backlink-table';
import { CitationChecklist } from '@/features/backlinks/components/citation-checklist';
import { BacklinkTrendChart } from '@/features/backlinks/components/backlink-trend-chart';
import { ToxicLinkAlert } from '@/features/backlinks/components/toxic-link-alert';
import { CitationSubmitTracker } from '@/features/backlinks/components/citation-submit-tracker';
import { Link2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function BacklinksPage() {
  let backlinks: any[] = [];
  let citations: any[] = [];
  try {
    backlinks = await db.backlink.findMany({ take: 30, orderBy: { firstSeen: 'desc' } });
    citations = await db.citationListing.findMany({ take: 20 });
  } catch (e) {
    backlinks = [];
    citations = [];
  }

  const toxicCount = backlinks.filter((b) => b.isToxic).length;
  const avgDa = backlinks.length > 0 ? Math.round(backlinks.reduce((acc, b) => acc + b.domainAuthority, 0) / backlinks.length) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Link2 className="h-5 w-5 text-primary" /> Backlink & Citation Inventory
        </h1>
        <p className="text-xs text-muted-foreground">Referring Domains, Toxic Link Detection & NAP Consistency Checker</p>
      </div>

      <BacklinkSummary
        totalBacklinks={backlinks.length}
        avgDomainAuthority={avgDa}
        toxicCount={toxicCount}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <BacklinkTable backlinks={backlinks} />
          <CitationChecklist citations={citations} />
        </div>
        <div className="space-y-6">
          <BacklinkTrendChart />
          <ToxicLinkAlert backlinks={backlinks} />
          <CitationSubmitTracker />
        </div>
      </div>
    </div>
  );
}
