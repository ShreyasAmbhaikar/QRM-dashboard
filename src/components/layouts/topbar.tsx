'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sun,
  Moon,
  Search,
  LogOut,
  Command,
  ChevronRight,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { NotificationBell } from '@/features/notifications/components/notification-bell';

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  const breadcrumbText = lastSegment
    ? lastSegment.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
    : 'Overview';

  return (
    <header className="h-14 border-b border-border bg-card px-6 flex items-center justify-between sticky top-0 z-20 select-none">
      {/* Breadcrumb Section */}
      <div className="flex items-center gap-2 text-xs">
        <span className="font-medium text-muted-foreground hover:text-foreground transition-colors">Quantum Reach</span>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
        <span className="font-semibold text-foreground capitalize">{breadcrumbText}</span>

        {/* Live System Operational Status Badge */}
        <div className="hidden md:flex items-center gap-1.5 ml-4 px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Operational</span>
        </div>
      </div>

      {/* Action Controls & Utilities */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="relative hidden sm:block w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search clients, terms (⌘K)..."
            className="pl-8 pr-8 h-8 text-xs bg-muted/40 border-border focus-visible:ring-primary rounded-lg"
          />
          <kbd className="absolute right-2 top-2 pointer-events-none inline-flex h-4 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[9px] font-medium text-muted-foreground opacity-100">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </div>

        {/* Theme Toggle Button */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 border-border rounded-lg hover:bg-accent"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle Theme"
        >
          <Sun className="h-3.5 w-3.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
          <Moon className="absolute h-3.5 w-3.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-purple-400" />
        </Button>

        {/* Notification Drawer Trigger */}
        <NotificationBell />

        {/* User Sign Out Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5 px-2.5 rounded-lg"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Sign Out</span>
        </Button>
      </div>
    </header>
  );
}
