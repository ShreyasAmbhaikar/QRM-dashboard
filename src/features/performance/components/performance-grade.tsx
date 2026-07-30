'use client';

import React from 'react';

interface PerformanceGradeProps {
  score: number;
}

export function PerformanceGrade({ score }: PerformanceGradeProps) {
  let grade = 'F';
  let colorClass = 'text-rose-400 border-rose-500/30 bg-rose-500/10';

  if (score >= 90) {
    grade = 'A';
    colorClass = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  } else if (score >= 70) {
    grade = 'B';
    colorClass = 'text-lime-400 border-lime-500/30 bg-lime-500/10';
  } else if (score >= 50) {
    grade = 'C';
    colorClass = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
  } else if (score >= 30) {
    grade = 'D';
    colorClass = 'text-orange-400 border-orange-500/30 bg-orange-500/10';
  }

  return (
    <div className={`flex flex-col items-center justify-center p-4 rounded-xl border ${colorClass}`}>
      <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Performance Grade</span>
      <span className="text-4xl font-black font-mono">{grade}</span>
      <span className="text-xs font-mono font-semibold">{score} / 100</span>
    </div>
  );
}
