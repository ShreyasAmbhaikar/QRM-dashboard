import React from 'react';
import { IntegrationKeyForm } from '@/features/settings/components/integration-key-form';
import { ArrowLeft, Key } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SettingsIntegrationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/settings">
          <div className="p-2 rounded-lg border border-border hover:bg-card">
            <ArrowLeft className="h-4 w-4" />
          </div>
        </Link>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" /> API Key Integrations
          </h1>
          <p className="text-xs text-muted-foreground">Manage and encrypt Google, DataForSEO, Resend, and AI API tokens</p>
        </div>
      </div>

      <IntegrationKeyForm />
    </div>
  );
}
