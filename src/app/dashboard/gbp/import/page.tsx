import React from 'react';
import { getPendingGoogleLocations } from '@/features/gbp/actions';
import { GbpImportForm } from '@/features/gbp/components/gbp-import-form';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface ImportPageProps {
  searchParams: Promise<{ connectionId?: string }>;
}

export default async function GbpImportPage({ searchParams }: ImportPageProps) {
  const params = await searchParams;
  const connectionId = params.connectionId;

  if (!connectionId) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Card className="max-w-md w-full border-destructive/50">
          <CardHeader className="text-center">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-2" />
            <CardTitle className="text-sm font-bold">Invalid Import Request</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4 text-xs">
            <p className="text-muted-foreground">
              A connection ID is required to fetch listing details from Google. Please restart the connect flow.
            </p>
            <Link href="/dashboard/gbp">
              <Button size="sm" className="w-full text-xs">
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const res = await getPendingGoogleLocations(connectionId);
  if (!res.success) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Card className="max-w-md w-full border-destructive/50">
          <CardHeader className="text-center">
            <ShieldAlert className="h-10 w-10 text-destructive mx-auto mb-2" />
            <CardTitle className="text-sm font-bold">Failed to load Google Account listings</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4 text-xs">
            <p className="text-muted-foreground">
              {res.error.message || 'The connection session may have expired or is invalid. Please link your Google account again.'}
            </p>
            <Link href="/dashboard/gbp">
              <Button size="sm" className="w-full text-xs">
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  const { locations, clients } = res.data;

  return (
    <GbpImportForm
      connectionId={connectionId}
      locations={locations}
      clients={clients}
    />
  );
}
