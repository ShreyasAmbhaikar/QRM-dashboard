'use client';

import React from 'react';
import { RankMarker } from './rank-marker';
import { GridPoint } from '../grid-calculator';

interface GridMapProps {
  points: GridPoint[];
  gridSize?: number;
}

export function GridMap({ points, gridSize = 5 }: GridMapProps) {
  return (
    <div className="relative w-full aspect-video rounded-xl border border-border bg-slate-950 p-6 flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

      <div
        className="grid gap-4 z-10 p-4 rounded-2xl bg-card/60 backdrop-blur border border-border shadow-2xl"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
        }}
      >
        {points.map((pt, i) => (
          <RankMarker key={i} rank={pt.rank} />
        ))}
      </div>

      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-3 text-[10px] bg-background/80 backdrop-blur px-3 py-1.5 rounded-full border border-border">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Rank 1-3 (Map Pack)</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Rank 4-7</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-500" /> Rank 8-10</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Rank 11+</span>
      </div>
    </div>
  );
}
