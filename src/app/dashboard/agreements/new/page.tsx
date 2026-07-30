import React from 'react';
import { db } from '@/lib/db';
import { AgreementForm } from '@/features/agreements/components/agreement-form';

export const dynamic = 'force-dynamic';

export default async function NewAgreementPage() {
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
    <div className="py-4">
      <AgreementForm clients={clients} />
    </div>
  );
}
