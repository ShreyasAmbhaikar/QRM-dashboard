import React from 'react';

export default function TasksLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 rounded-md bg-muted" />
      <div className="grid grid-cols-4 gap-6">
        <div className="h-96 rounded-xl bg-muted" />
        <div className="h-96 rounded-xl bg-muted" />
        <div className="h-96 rounded-xl bg-muted" />
        <div className="h-96 rounded-xl bg-muted" />
      </div>
    </div>
  );
}
