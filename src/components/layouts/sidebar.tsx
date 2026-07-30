'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FileSignature,
  MapPin,
  Search,
  Crosshair,
  Image as ImageIcon,
  Grid,
  FileText,
  MessageSquare,
  Share2,
  ListTodo,
  Gauge,
  Bell,
  Activity,
  Settings,
  Sparkles,
  ChevronDown,
  Command,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  userRole?: string;
}

interface NavSection {
  category: string;
  items: {
    title: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
    badgeVariant?: 'primary' | 'success' | 'warning';
  }[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    category: 'Main',
    items: [{ title: 'Overview', href: '/dashboard', icon: LayoutDashboard }],
  },
  {
    category: 'Core Operations',
    items: [
      { title: 'Client Portfolio', href: '/dashboard/clients', icon: Users },
      { title: 'Lead Pipeline', href: '/dashboard/leads', icon: UserPlus },
      { title: 'Agreements', href: '/dashboard/agreements', icon: FileSignature },
      { title: 'GBP Optimization', href: '/dashboard/gbp', icon: MapPin },
    ],
  },
  {
    category: 'SEO & Intelligence',
    items: [
      { title: 'Keyword Hub', href: '/dashboard/keywords', icon: Search },
      { title: 'Competitors', href: '/dashboard/competitors', icon: Crosshair },
      { title: 'Local Grid Scan', href: '/dashboard/local-grid', icon: Grid, badge: 'Live', badgeVariant: 'success' },
      { title: 'SEO Audit', href: '/dashboard/seo-audit', icon: Sparkles },
      { title: 'Backlinks & Citations', href: '/dashboard/backlinks', icon: Share2 },
    ],
  },
  {
    category: 'AI & Automation',
    items: [
      { title: 'GBP Post Studio', href: '/dashboard/posts', icon: ImageIcon, badge: 'AI', badgeVariant: 'primary' },
      { title: 'Service Page Wizard', href: '/dashboard/service-pages', icon: FileText },
      { title: 'Review Auto-Replies', href: '/dashboard/auto-replies', icon: MessageSquare },
    ],
  },
  {
    category: 'Management',
    items: [
      { title: 'Task Board', href: '/dashboard/tasks', icon: ListTodo },
      { title: 'Web Performance', href: '/dashboard/performance', icon: Gauge },
      { title: 'Notifications', href: '/dashboard/notifications', icon: Bell },
      { title: 'Activity Audit Log', href: '/dashboard/activity-log', icon: Activity },
      { title: 'Agency Settings', href: '/dashboard/settings', icon: Settings },
    ],
  },
];

export function Sidebar({ userRole: _userRole }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-72 border-r border-border bg-card flex flex-col h-screen sticky top-0 z-30 transition-all select-none animate-in slide-in-from-left duration-250">
      {/* Workspace Switcher */}
      <div className="p-3.5 border-b border-border">
        <button className="w-full flex items-center justify-between p-2 rounded-md bg-muted/40 hover:bg-accent border border-border/80 transition-all group">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-7 w-7 rounded-md bg-primary/15 border border-primary/30 text-primary flex items-center justify-center font-bold text-xs shrink-0 shadow-sm animate-pulse">
              <Zap className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col text-left truncate">
              <span className="font-semibold text-xs leading-tight truncate">Quantum Reach</span>
              <span className="text-[10px] text-muted-foreground font-medium">Enterprise Pro</span>
            </div>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
        </button>
      </div>

      {/* Quick Search Shortcut Trigger */}
      <div className="px-3 pt-3 pb-1">
        <button className="w-full flex items-center justify-between px-3 py-1.5 rounded-md border border-border bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-accent text-xs transition-all">
          <span className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5" />
            <span className="text-[11px]">Quick Jump...</span>
          </span>
          <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[9px] font-medium text-muted-foreground opacity-100">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.category} className="space-y-1">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
              {section.category}
            </div>
            {section.items.map((item) => {
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.href);

              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all group relative',
                    isActive
                      ? 'bg-primary/10 text-primary border-l-2 border-primary pl-2 rounded-r-md font-semibold'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-transform group-hover:scale-105',
                      isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                    )}
                  />
                  <span className="truncate">{item.title}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        'ml-auto text-[9px] font-bold px-1.5 py-0.2 rounded-md border',
                        item.badgeVariant === 'success'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-primary/20 text-primary border-primary/30'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Profile User Card */}
      <div className="p-3 border-t border-border bg-muted/20">
        <div className="flex items-center justify-between p-2 rounded-md bg-card border border-border shadow-sm">
          <div className="flex items-center gap-2.5 truncate">
            <div className="relative">
              <div className="h-7 w-7 rounded-md bg-primary/20 border border-primary/30 text-primary font-bold flex items-center justify-center text-xs">
                SA
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-foreground truncate leading-tight">Shreyas A.</span>
              <span className="text-[10px] text-muted-foreground truncate">Agency Super Admin</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
