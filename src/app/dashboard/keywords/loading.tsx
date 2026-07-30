import React from 'react';

export default function KeywordsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 rounded-md bg-muted" />
      <div className="h-32 rounded-xl bg-muted" />
      <div className="h-96 rounded-xl bg-muted" />
    </div>
  );
}
