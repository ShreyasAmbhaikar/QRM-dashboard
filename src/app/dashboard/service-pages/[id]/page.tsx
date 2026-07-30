import React from 'react';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { ContentPreview } from '@/features/service-pages/components/content-preview';
import { JsonLdPreview } from '@/features/service-pages/components/json-ld-preview';
import { ExportOptions } from '@/features/service-pages/components/export-options';
import { ArrowLeft, FileText, MapPin } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface ServicePageDetailProps {
  params: Promise<{ id: string }>;
}

export default async function ServicePageDetail({ params }: ServicePageDetailProps) {
  const { id } = await params;

  let page: any = null;
  try {
    page = await db.servicePage.findUnique({
      where: { id },
      include: { client: true },
    });
  } catch (e) {
    page = null;
  }

  if (!page) notFound();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/service-pages">
            <div className="p-2 rounded-lg border border-border hover:bg-card">
              <ArrowLeft className="h-4 w-4" />
            </div>
          </Link>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> {page.serviceName}
            </h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-rose-400" /> {page.targetCity} — {page.client.name}
            </p>
          </div>
        </div>

        <ExportOptions htmlContent={page.htmlContent} jsonLdSchema={page.jsonLdSchema} />
      </div>

      <ContentPreview htmlContent={page.htmlContent} />

      <JsonLdPreview jsonLdSchema={page.jsonLdSchema} />
    </div>
  );
}
