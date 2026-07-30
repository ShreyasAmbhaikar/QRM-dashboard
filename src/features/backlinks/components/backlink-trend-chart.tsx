'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function BacklinkTrendChart() {
  // Mock historical data for trend representation
  const data = [
    { month: 'Feb', count: 12 },
    { month: 'Mar', count: 15 },
    { month: 'Apr', count: 18 },
    { month: 'May', count: 24 },
    { month: 'Jun', count: 28 },
    { month: 'Jul', count: 35 },
  ];

  const maxVal = Math.max(...data.map((d) => d.count)) * 1.2;
  const points = data
    .map((d, i) => `${(i / (data.length - 1)) * 100},${100 - (d.count / maxVal) * 100}`)
    .join(' ');

  return (
    <Card className="border-border text-xs">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold">Backlink Profile Growth</CardTitle>
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
              fill="url(#backlinkGrad)"
              opacity="0.15"
            />
            
            {/* Line path */}
            <polyline
              fill="none"
              stroke="var(--color-primary, #3b82f6)"
              strokeWidth="2"
              points={points}
              className="text-primary"
            />

            {/* Definitions */}
            <defs>
              <linearGradient id="backlinkGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary, #3b82f6)" />
                <stop offset="100%" stopColor="var(--color-primary, #3b82f6)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Data points */}
            {data.map((d, i) => {
              const cx = (i / (data.length - 1)) * 100;
              const cy = 100 - (d.count / maxVal) * 100;
              return (
                <g key={i} className="group/dot">
                  <circle
                    cx={cx}
                    cy={cy}
                    r="2.5"
                    fill="var(--background)"
                    stroke="var(--color-primary, #3b82f6)"
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-200 hover:r-[4] text-primary"
                  />
                  {/* Tooltip on hover */}
                  <text
                    x={cx}
                    y={cy - 6}
                    textAnchor="middle"
                    className="fill-foreground font-mono text-[6px] font-bold opacity-0 group-hover/dot:opacity-100 transition-opacity duration-200"
                  >
                    {d.count}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* X axis labels */}
          <div className="flex justify-between text-[10px] text-muted-foreground mt-2 border-t border-border/50 pt-2 font-mono">
            {data.map((d, i) => (
              <span key={i}>{d.month}</span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
