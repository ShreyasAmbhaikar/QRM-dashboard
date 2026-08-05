'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface ClientSelectorItem {
  id: string;
  name: string;
}

interface GbpClientSwitcherProps {
  currentClientId?: string;
  clients: ClientSelectorItem[];
}

export function GbpClientSwitcher({ currentClientId, clients }: GbpClientSwitcherProps) {
  const router = useRouter();

  const handleSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'OVERVIEW') {
      router.push('/dashboard/gbp');
    } else if (val) {
      router.push(`/dashboard/gbp/${val}`);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap shrink-0">
        Active Profile:
      </span>
      <div className="relative min-w-[240px] max-w-sm">
        <select
          value={currentClientId || 'OVERVIEW'}
          onChange={handleSwitch}
          className="h-8 pl-3 pr-8 rounded-md border border-border bg-card text-xs text-foreground font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary w-full cursor-pointer appearance-none shadow-sm hover:bg-muted/10 transition-all"
        >
          <option value="OVERVIEW">📁 All Connected Clients (Overview)</option>
          {clients.length > 0 && (
            <optgroup label="Select Connected Profile">
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  🏢 {c.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/75">
          <svg
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
