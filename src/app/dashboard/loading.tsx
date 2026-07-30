import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 rounded-md bg-muted" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="h-32 rounded-xl bg-muted" />
        <div className="h-32 rounded-xl bg-muted" />
        <div className="h-32 rounded-xl bg-muted" />
        <div className="h-32 rounded-xl bg-muted" />
      </div>
      <div className="h-96 rounded-xl bg-muted" />
    </div>
  );
}
