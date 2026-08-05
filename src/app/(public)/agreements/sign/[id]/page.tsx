import React from 'react';
import { getPublicAgreementById } from '@/features/agreements/actions';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { PublicSignClientPage } from './client-page';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const res = await getPublicAgreementById(id);
  
  if (!res.success || !res.data) {
    return {
      title: 'Agreement Not Found',
    };
  }

  return {
    title: `Sign: ${res.data.title} — Quantum Reach Media`,
    description: `Review and sign the digital marketing and SEO services agreement for ${res.data.client.name}.`,
  };
}

export default async function PublicSigningPage({ params }: PageProps) {
  const { id } = await params;
  const response = await getPublicAgreementById(id);

  if (!response.success || !response.data) {
    notFound();
  }

  const agreement = response.data;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border p-5 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Service Retainer Agreement</h1>
          <p className="text-xs text-muted-foreground">
            Contract: <span className="font-semibold text-primary">{agreement.title}</span> • Prepared for {agreement.client.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-medium">Status:</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              agreement.status === 'SIGNED'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}
          >
            {agreement.status}
          </span>
        </div>
      </div>

      {/* Render Interactive Client Page */}
      <PublicSignClientPage initialAgreement={agreement} />
    </div>
  );
}
