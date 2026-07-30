import React from 'react';
import { AppearanceSelector } from '@/features/settings/components/appearance-selector';
import { DangerZone } from '@/features/settings/components/danger-zone';
import { ArrowLeft, Palette } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SettingsAppearancePage() {
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
            <Palette className="h-5 w-5 text-primary" /> Appearance & Theme Preference
          </h1>
          <p className="text-xs text-muted-foreground">Customize UI themes, report layout colors, and reset system properties</p>
        </div>
      </div>

      <AppearanceSelector />
      <DangerZone />
    </div>
  );
}
