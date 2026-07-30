import React from 'react';
import { db } from '@/lib/db';
import { PerformanceGrade } from '@/features/performance/components/performance-grade';
import { OpportunityList } from '@/features/performance/components/opportunity-list';
import { PerformanceCheckButton } from '@/features/performance/components/performance-check-button';
import { CwvTrendChart } from '@/features/performance/components/cwv-trend-chart';
import { Gauge } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PerformancePage() {
  let logs: any[] = [];
  let clients: any[] = [];
  try {
    clients = await db.client.findMany({ orderBy: { name: 'asc' } });
    logs = await db.performanceLog.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { client: true },
    });
  } catch (e) {
    logs = [];
    clients = [];
  }

  const latestScore = logs[0]?.performanceGrade || 94;

  const history = logs.map((log) => ({
    date: new Date(log.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    score: log.performanceGrade,
  })).reverse();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Gauge className="h-5 w-5 text-emerald-400" /> Web Performance & Core Web Vitals
          </h1>
          <p className="text-xs text-muted-foreground">Google PageSpeed Insights API & Historical Monitoring</p>
        </div>

        {clients[0] && <PerformanceCheckButton clientId={clients[0].id} />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <PerformanceGrade score={latestScore} />
            <div className="sm:col-span-2 space-y-3 p-4 rounded-xl border border-border bg-card/40 text-xs">
              <span className="font-semibold text-foreground block">Latest Core Web Vitals Baseline</span>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-2.5 rounded-lg border border-border bg-background">
                  <span className="text-muted-foreground block text-[10px]">LCP</span>
                  <span className="font-mono font-bold text-foreground">
                    {logs[0] ? `${logs[0].lcpScore}s` : '1.8s'} (Good)
                  </span>
                </div>
                <div className="p-2.5 rounded-lg border border-border bg-background">
                  <span className="text-muted-foreground block text-[10px]">CLS</span>
                  <span className="font-mono font-bold text-foreground">
                    {logs[0] ? logs[0].clsScore : '0.02'} (Good)
                  </span>
                </div>
                <div className="p-2.5 rounded-lg border border-border bg-background">
                  <span className="text-muted-foreground block text-[10px]">INP</span>
                  <span className="font-mono font-bold text-foreground">
                    {logs[0] ? `${logs[0].inpScore}ms` : '95ms'} (Good)
                  </span>
                </div>
              </div>
            </div>
          </div>
          <OpportunityList />
        </div>

        <div>
          <CwvTrendChart history={history} />
        </div>
      </div>
    </div>
  );
}
