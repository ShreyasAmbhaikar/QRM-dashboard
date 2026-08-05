import React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AgencyProfileForm } from '@/features/settings/components/agency-profile-form';
import { ArrowLeft, User } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SettingsProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const user = {
    name: session.user.name || 'Admin User',
    email: session.user.email || 'admin@quantumreachmedia.com',
    image: session.user.image || '',
  };

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
            <User className="h-5 w-5 text-primary" /> Agency Profile & Settings
          </h1>
          <p className="text-xs text-muted-foreground">Manage profile, agency branding and contact coordinates</p>
        </div>
      </div>

      <AgencyProfileForm initialUser={user} />
    </div>
  );
}
