import React from 'react';
import { db } from '@/lib/db';
import { RbacMatrix } from '@/features/settings/components/rbac-matrix';
import { ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function TeamSettingsPage() {
  let users: any[] = [];
  try {
    users = await db.user.findMany({ include: { permission: true } });
  } catch (e) {
    users = [];
  }

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
            <Users className="h-5 w-5 text-primary" /> Team Management & RBAC Matrix
          </h1>
          <p className="text-xs text-muted-foreground">Configure User Roles and Fine-Grained Module Access</p>
        </div>
      </div>

      <RbacMatrix users={users} />
    </div>
  );
}
