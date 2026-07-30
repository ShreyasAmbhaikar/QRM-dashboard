'use client';

import React, { useState } from 'react';
import { generateServicePageContent } from '../actions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Client } from '@prisma/client';

interface PageWizardProps {
  clients: Client[];
  onComplete?: () => void;
}

export function PageWizard({ clients, onComplete }: PageWizardProps) {
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [serviceName, setServiceName] = useState('');
  const [targetCity, setTargetCity] = useState('');
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !serviceName || !targetCity || !primaryKeyword) return;

    setGenerating(true);
    try {
      const res = await generateServicePageContent({
        clientId,
        serviceName,
        targetCity,
        primaryKeyword,
      });

      if (res.success && onComplete) {
        onComplete();
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" /> Service Page Generation Wizard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-muted-foreground font-medium">Select Client</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full rounded-md border border-input bg-background p-2 text-xs"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.domain})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-muted-foreground font-medium">Service Name</label>
              <input
                type="text"
                placeholder="e.g. Emergency Plumbing Repair"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="w-full rounded-md border border-input bg-background p-2 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-muted-foreground font-medium">Target City / Region</label>
              <input
                type="text"
                placeholder="e.g. Chicago, IL"
                value={targetCity}
                onChange={(e) => setTargetCity(e.target.value)}
                className="w-full rounded-md border border-input bg-background p-2 text-xs"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-muted-foreground font-medium">Primary Target Keyword</label>
            <input
              type="text"
              placeholder="e.g. 24 7 emergency plumber chicago"
              value={primaryKeyword}
              onChange={(e) => setPrimaryKeyword(e.target.value)}
              className="w-full rounded-md border border-input bg-background p-2 text-xs"
              required
            />
          </div>

          <Button type="submit" disabled={generating} className="w-full gap-2 text-xs">
            <Sparkles className="h-4 w-4" /> {generating ? 'Generating 1,200+ Word Page...' : 'Generate Service Page'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
