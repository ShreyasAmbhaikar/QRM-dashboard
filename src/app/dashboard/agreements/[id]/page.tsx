import React from 'react';
import { getAgreementById } from '@/features/agreements/actions';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { AgreementDashboard } from '@/features/agreements/components/agreement-dashboard';

export default async function AgreementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const response = await getAgreementById(id);

  if (!response.success || !response.data) {
    notFound();
  }

  const agreement = response.data;
  
  let clients: { id: string; name: string; domain: string }[] = [];
  try {
    clients = await db.client.findMany({
      select: { id: true, name: true, domain: true },
      orderBy: { name: 'asc' },
    });
  } catch (e) {
    clients = [];
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/agreements">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <span className="text-xs text-muted-foreground font-medium">Back to Service Agreements</span>
      </div>

      <AgreementDashboard initialAgreement={agreement} clients={clients} />
    </div>
  );
}
