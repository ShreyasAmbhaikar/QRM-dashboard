'use client';

import React, { useState } from 'react';
import { triggerSeoAudit } from '../actions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Globe } from 'lucide-react';
import { Client } from '@prisma/client';

interface AuditTriggerFormProps {
  clients: Client[];
  onAuditStarted?: () => void;
}

export function AuditTriggerForm({ clients, onAuditStarted }: AuditTriggerFormProps) {
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [domainUrl, setDomainUrl] = useState(clients[0]?.domain || '');
  const [running, setRunning] = useState(false);

  const handleClientChange = (id: string) => {
    setClientId(id);
    const selected = clients.find((c) => c.id === id);
    if (selected) setDomainUrl(selected.domain);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !domainUrl) return;

    setRunning(true);
    try {
      const res = await triggerSeoAudit({ clientId, domainUrl });
      if (res.success && onAuditStarted) {
        onAuditStarted();
      }
    } finally {
      setRunning(false);
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" /> Run Playwright Headless Website Audit
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-muted-foreground font-medium">Target Client</label>
              <select
                value={clientId}
                onChange={(e) => handleClientChange(e.target.value)}
                className="w-full rounded-md border border-input bg-background p-2 text-xs"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.domain})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-muted-foreground font-medium">Domain URL to Crawl</label>
              <input
                type="text"
                placeholder="https://example.com"
                value={domainUrl}
                onChange={(e) => setDomainUrl(e.target.value)}
                className="w-full rounded-md border border-input bg-background p-2 text-xs"
                required
              />
            </div>
          </div>

          <Button type="submit" disabled={running} className="w-full gap-2 text-xs">
            <Play className="h-4 w-4" /> {running ? 'Crawling Website & Running Audit...' : 'Start Technical Audit'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
