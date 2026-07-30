import React from 'react';
import { db } from '@/lib/db';
import { GridMap } from '@/features/local-grid/components/grid-map';
import { generateGridPoints } from '@/features/local-grid/grid-calculator';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MapPin, Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function LocalGridOverviewPage() {
  const center = { lat: 41.8781, lng: -87.6298 }; // Chicago Center
  const defaultPoints = generateGridPoints(center, 5, 5).map((pt) => {
    const distFromCenter = Math.sqrt(Math.pow(pt.row - 2, 2) + Math.pow(pt.col - 2, 2));
    const simulatedRank = Math.min(20, Math.max(1, Math.round(distFromCenter * 2.8 + 1)));
    return { ...pt, rank: simulatedRank };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Local Ranking Geo-Grid Heatmap</h1>
        <p className="text-sm text-muted-foreground">
          Visualize search ranking positions across a geographic lat/lng coordinate grid for local Map Pack tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-border lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" /> Grid Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-muted-foreground">Target Keyword</label>
              <input
                type="text"
                defaultValue="Emergency Plumber Chicago"
                className="w-full rounded-md border border-input bg-background p-2 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-muted-foreground">Grid Matrix Size</label>
                <select className="w-full rounded-md border border-input bg-background p-2 text-xs">
                  <option value="3">3 × 3 (9 Points)</option>
                  <option value="5" selected>5 × 5 (25 Points)</option>
                  <option value="7">7 × 7 (49 Points)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground">Radius (Miles)</label>
                <select className="w-full rounded-md border border-input bg-background p-2 text-xs">
                  <option value="2">2 Miles</option>
                  <option value="5" selected>5 Miles</option>
                  <option value="10">10 Miles</option>
                </select>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
              <span className="font-semibold text-foreground flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-primary" /> Geo-Coordinates Center
              </span>
              <p className="text-[11px] text-muted-foreground">Lat: 41.8781° N, Lng: -87.6298° W</p>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <GridMap points={defaultPoints} gridSize={5} />
        </div>
      </div>
    </div>
  );
}
