'use client';

import React from 'react';

const MODULES = [
  'Dashboard', 'Clients', 'Leads', 'Agreements', 'GBP', 'Keywords',
  'Competitors', 'Posts', 'Local Grid', 'Audits', 'Service Pages',
  'Auto Replies', 'Backlinks', 'Citations', 'Tasks', 'Performance',
  'Notifications', 'Settings'
];

export function RbacMatrixHeader() {
  return (
    <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px]">
      <tr>
        <th className="p-3 min-w-[150px] sticky left-0 bg-card border-r border-border">Team Member</th>
        {MODULES.map((mod) => (
          <th key={mod} className="p-3 text-center min-w-[90px]">{mod}</th>
        ))}
      </tr>
    </thead>
  );
}
