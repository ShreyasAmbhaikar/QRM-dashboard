import React from 'react';
import { db } from '@/lib/db';
import { Settings, Users, Key, Palette, User } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SettingsOverview() {
  return (
    <div className="space-y-6 text-xs">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" /> Settings & Administration
        </h1>
        <p className="text-xs text-muted-foreground">Agency Branding, Team Management & 18-Module RBAC Matrix</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboard/settings/profile" className="block group">
          <div className="p-4 rounded-xl border border-border bg-card hover:bg-muted/10 transition-all duration-200 h-full flex flex-col justify-between space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                <User className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold text-foreground block">Agency Profile</span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">Manage branding details</span>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/settings/team" className="block group">
          <div className="p-4 rounded-xl border border-border bg-card hover:bg-muted/10 transition-all duration-200 h-full flex flex-col justify-between space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold text-foreground block">Team & Roles</span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">RBAC 18-module permissions</span>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/settings/integrations" className="block group">
          <div className="p-4 rounded-xl border border-border bg-card hover:bg-muted/10 transition-all duration-200 h-full flex flex-col justify-between space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold text-foreground block">API Keys</span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">Configure access tokens</span>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/settings/appearance" className="block group">
          <div className="p-4 rounded-xl border border-border bg-card hover:bg-muted/10 transition-all duration-200 h-full flex flex-col justify-between space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-pink-500/10 text-pink-400 group-hover:bg-pink-500/20 transition-colors">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold text-foreground block">Appearance</span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">Themes & theme parameters</span>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
