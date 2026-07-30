'use client';

import React, { useState, useEffect } from 'react';
import { getKeywords, KeywordWithRelations } from '@/features/keywords/actions';
import { KeywordSearch } from '@/features/keywords/components/keyword-search';
import { BulkImportModal } from '@/features/keywords/components/bulk-import-modal';
import { IntentBadge } from '@/features/keywords/components/intent-badge';
import { SerpFeatureTag } from '@/features/keywords/components/serp-feature-tag';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Upload, BarChart2 } from 'lucide-react';

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<KeywordWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  const fetchKeywords = async () => {
    setLoading(true);
    const res = await getKeywords();
    if (res.success) {
      setKeywords(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchKeywords();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Keyword Research & Rank Tracker</h1>
          <p className="text-sm text-muted-foreground">
            Track organic SERP rankings, search volumes, CPC, and intent metrics via DataForSEO.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setIsBulkOpen(true)} className="gap-2 text-xs">
            <Upload className="h-4 w-4" /> Bulk Import CSV
          </Button>
          <Button className="gap-2 shadow-lg">
            <Plus className="h-4 w-4" /> Add Tracked Keyword
          </Button>
        </div>
      </div>

      <KeywordSearch />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-indigo-400" /> Tracked Keywords Inventory ({keywords.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-32 rounded-xl bg-muted animate-pulse" />
          ) : (
            <div className="space-y-3">
              {keywords.map((kw) => (
                <div
                  key={kw.id}
                  className="p-4 rounded-xl border border-border bg-card/40 flex items-center justify-between gap-4 text-xs hover:border-primary/40 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{kw.term}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {kw.client.name}
                      </Badge>
                      <SerpFeatureTag feature="LOCAL_PACK" />
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground text-[11px]">
                      <span>Volume: {kw.searchVolume.toLocaleString()}/mo</span>
                      <span>CPC: ${kw.cpc}</span>
                      <span>Difficulty: {kw.difficulty}/100</span>
                      <IntentBadge intent={kw.intent} />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="font-mono text-sm px-3 py-1">
                      Rank #{kw.currentRank || 'N/A'}
                    </Badge>
                  </div>
                </div>
              ))}

              {keywords.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">
                  No tracked keywords found. Click "Add Tracked Keyword" to start tracking.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <BulkImportModal open={isBulkOpen} onOpenChange={setIsBulkOpen} />
    </div>
  );
}
