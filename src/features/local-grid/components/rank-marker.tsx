'use client';

import React from 'react';

interface RankMarkerProps {
  rank?: number;
}

export function RankMarker({ rank = 20 }: RankMarkerProps) {
  let bgColor = 'bg-red-500 text-white';
  if (rank <= 3) {
    bgColor = 'bg-emerald-500 text-white font-bold ring-2 ring-emerald-300';
  } else if (rank <= 7) {
    bgColor = 'bg-amber-500 text-white';
  } else if (rank <= 10) {
    bgColor = 'bg-orange-500 text-white';
  }

  return (
    <div
      className={`h-7 w-7 rounded-full flex items-center justify-center text-xs shadow-md transition-transform hover:scale-125 cursor-pointer ${bgColor}`}
    >
      {rank}
    </div>
  );
}
