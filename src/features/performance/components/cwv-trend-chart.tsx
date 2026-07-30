'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface HistoryItem {
  date: string;
  score: number;
}

interface CwvTrendChartProps {
  history: HistoryItem[];
}

export function CwvTrendChart({ history }: CwvTrendChartProps) {
  // If history is empty, use mock values for rendering
  const chartData = history.length > 0 ? history : [
    { date: '1d ago', score: 92 },
    { date: '2d ago', score: 89 },
    { date: '3d ago', score: 90 },
    { date: '4d ago', score: 94 },
    { date: '5d ago', score: 93 },
    { date: '6d ago', score: 95 },
  ];

  const maxVal = 100;
  const points = chartData
    .map((d, i) => `${(i / (chartData.length - 1)) * 100},${100 - (d.score / maxVal) * 100}`)
    .join(' ');

  return (
    <Card className="border-border text-xs">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold">Historical Performance Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-[180px] mt-4 flex flex-col justify-between">
          <svg className="w-full h-[130px] overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" strokeWidth="0.1" className="text-muted-foreground/20" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.1" className="text-muted-foreground/20" />
            <line x1="0" y1="75" x2="100" y2="75" stroke="currentColor" strokeWidth="0.1" className="text-muted-foreground/20" />

            {/* Area path */}
            <path
              d={`M 0,100 L ${points} L 100,100 Z`}
              fill="url(#perfGrad)"
              opacity="0.15"
            />

            {/* Line path */}
            <polyline
              fill="none"
              stroke="var(--color-emerald-400, #34d399)"
              strokeWidth="2"
              points={points}
              className="text-emerald-400"
            />

            {/* Definitions */}
            <defs>
              <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-emerald-400, #34d399)" />
                <stop offset="100%" stopColor="var(--color-emerald-400, #34d399)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Data points */}
            {chartData.map((d, i) => {
              const cx = (i / (chartData.length - 1)) * 100;
              const cy = 100 - (d.score / maxVal) * 100;
              return (
                <g key={i} className="group/dot">
                  <circle
                    cx={cx}
                    cy={cy}
                    r="2.5"
                    fill="var(--background)"
                    stroke="var(--color-emerald-400, #34d399)"
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-200 hover:r-[4] text-emerald-400"
                  />
                  <text
                    x={cx}
                    y={cy - 6}
                    textAnchor="middle"
                    className="fill-foreground font-mono text-[6px] font-bold opacity-0 group-hover/dot:opacity-100 transition-opacity duration-200"
                  >
                    {d.score}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* X axis labels */}
          <div className="flex justify-between text-[10px] text-muted-foreground mt-2 border-t border-border/50 pt-2 font-mono">
            {chartData.map((d, i) => (
              <span key={i}>{d.date}</span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
