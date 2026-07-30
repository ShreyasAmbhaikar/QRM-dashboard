import React from 'react';
import { db } from '@/lib/db';
import { PageWizard } from '@/features/service-pages/components/page-wizard';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function NewServicePage() {
  let clients: any[] = [];
  try {
    clients = await db.client.findMany({ orderBy: { name: 'asc' } });
  } catch (e) {
    clients = [];
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/service-pages">
          <div className="p-2 rounded-lg border border-border hover:bg-card">
            <ArrowLeft className="h-4 w-4" />
          </div>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Generate New Service Page</h1>
          <p className="text-xs text-muted-foreground">Localized Landing Page & Schema.org JSON-LD Wizard</p>
        </div>
      </div>

      <PageWizard clients={clients} />
    </div>
  );
}
