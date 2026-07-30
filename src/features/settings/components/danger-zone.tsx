'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export function DangerZone() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Your agency data export bundle (.json) has started downloading.');
    }, 1200);
  };

  const handleDelete = () => {
    if (confirm('Are you absolutely sure you want to delete this agency account? This action is irreversible and deletes all client data, audits, and posts.')) {
      alert('Account deletion initiated.');
    }
  };

  return (
    <Card className="border-rose-500/20 bg-rose-500/5 text-xs">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-rose-500">
          <AlertCircle className="h-4 w-4" /> Danger Zone
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-background border border-border rounded-xl">
          <div>
            <span className="font-bold text-foreground">Export Agency Data</span>
            <span className="text-[10px] text-muted-foreground block mt-0.5">Download a copy of all clients, agreements, leads, and keywords.</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting} className="h-8 text-xs">
            {isExporting ? 'Exporting...' : 'Export Data'}
          </Button>
        </div>

        <div className="flex items-center justify-between p-3 bg-background border border-border rounded-xl">
          <div>
            <span className="font-bold text-foreground">Delete Account</span>
            <span className="text-[10px] text-muted-foreground block mt-0.5">Permanently remove your agency tenant profile.</span>
          </div>
          <Button variant="destructive" size="sm" onClick={handleDelete} className="h-8 text-xs bg-rose-600 hover:bg-rose-700">
            Delete Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
