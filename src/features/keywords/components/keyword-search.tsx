'use client';

import React, { useState } from 'react';
import { searchKeywordIdeas } from '../actions';
import { KeywordSearchMetrics } from '@/lib/api/dataforseo';
import { IntentBadge } from './intent-badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Sparkles, TrendingUp } from 'lucide-react';

interface KeywordSearchProps {
  onAddKeyword?: (metrics: KeywordSearchMetrics) => void;
}

export function KeywordSearch({ onAddKeyword }: KeywordSearchProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<KeywordSearchMetrics[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await searchKeywordIdeas(query.trim());
      if (res.success) {
        setResults(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Search className="h-4 w-4 text-primary" /> Live DataForSEO Keyword Discovery
        </CardTitle>
        <CardDescription className="text-xs">
          Analyze real-time search volumes, CPC, competition index, and automated intent.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <Input
            placeholder="Enter seed term (e.g., emergency electrician nyc)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-md h-9 text-xs"
          />
          <Button type="submit" size="sm" disabled={loading} className="gap-2 text-xs">
            <Search className="h-3.5 w-3.5" /> {loading ? 'Fetching...' : 'Analyze Keyword'}
          </Button>
        </form>

        {results.length > 0 && (
          <div className="border border-border rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] font-semibold">
                <tr>
                  <th className="px-4 py-2.5">Keyword Term</th>
                  <th className="px-4 py-2.5">Monthly Volume</th>
                  <th className="px-4 py-2.5">Est. CPC</th>
                  <th className="px-4 py-2.5">Competition</th>
                  <th className="px-4 py-2.5">Intent</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {results.map((item, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 font-bold text-foreground">{item.keyword}</td>
                    <td className="px-4 py-2.5 font-mono">{item.searchVolume.toLocaleString()}/mo</td>
                    <td className="px-4 py-2.5 font-mono text-emerald-400">${item.cpc.toFixed(2)}</td>
                    <td className="px-4 py-2.5">{(item.competition * 100).toFixed(0)}%</td>
                    <td className="px-4 py-2.5">
                      <IntentBadge intent={item.intent} />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {onAddKeyword && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px] gap-1"
                          onClick={() => onAddKeyword(item)}
                        >
                          <Plus className="h-3 w-3" /> Track
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
