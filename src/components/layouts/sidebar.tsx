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
  ImageIcon,
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
  ChevronLeft,
  ChevronRight,
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
    ],
  },
];

export function Sidebar({ userRole: _userRole }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed') === 'true';
    setIsCollapsed(saved);
    setMounted(true);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  };

  const showCollapsed = mounted && isCollapsed;

  return (
    <aside 
      className={cn(
        "border-r border-border bg-card flex flex-col h-screen sticky top-0 z-30 transition-all duration-300 ease-in-out select-none relative shrink-0",
        showCollapsed ? "w-[68px]" : "w-72"
      )}
    >
      {/* Floating Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute top-[26px] -right-[10px] z-40 bg-card border border-border text-muted-foreground hover:text-foreground h-5 w-5 rounded-full flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-110 active:scale-95"
        aria-label={showCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {showCollapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Branding Header */}
      <div className={cn(
        "border-b border-border flex items-center select-none h-[73px] transition-all duration-300",
        showCollapsed ? "justify-center px-2" : "justify-start p-4"
      )}>
        <Link href="/dashboard" className="flex items-center gap-3">
          <img src="/qrm-logo.png" alt="QRM Logo" className="h-10 object-contain shrink-0" />
          {!showCollapsed && (
            <div className="flex flex-col text-left animate-in fade-in duration-300">
              <span className="font-extrabold text-[15px] leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 font-sans">
                Quantum Reach
              </span>
              <span className="font-bold text-[10px] leading-none tracking-[0.25em] text-[#a78bfa] uppercase mt-1 font-sans">
                Media
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Quick Search Shortcut Trigger */}
      <div className={cn("px-3 pt-3 pb-1 transition-all duration-300", showCollapsed ? "flex justify-center" : "")}>
        {!showCollapsed ? (
          <button className="w-full flex items-center justify-between px-3 py-1.5 rounded-md border border-border bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-accent text-xs transition-all">
            <span className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5" />
              <span className="text-[11px]">Quick Jump...</span>
            </span>
            <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[9px] font-medium text-muted-foreground opacity-100">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </button>
        ) : (
          <button 
            className="p-2 rounded-md border border-border bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-accent transition-all cursor-pointer"
            title="Quick Jump (Cmd+K)"
          >
            <Search className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 scrollbar-none">
        {NAV_SECTIONS.map((section) => (
          <div key={section.category} className="space-y-1">
            {!showCollapsed ? (
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 animate-in fade-in duration-300">
                {section.category}
              </div>
            ) : (
              <div className="h-px bg-border/60 my-2 mx-1" />
            )}
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
                    'flex items-center rounded-md text-xs font-medium transition-all group relative',
                    showCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-2.5 py-1.5',
                    isActive
                      ? 'bg-primary/10 text-primary border-l-2 border-primary pl-2 rounded-r-md font-semibold'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                  title={showCollapsed ? item.title : undefined}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-transform group-hover:scale-105',
                      isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                    )}
                  />
                  {!showCollapsed && (
                    <span className="truncate animate-in fade-in duration-300">{item.title}</span>
                  )}
                  {!showCollapsed && item.badge && (
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

      {/* Footer Settings Button */}
      <div className="p-3.5 border-t border-border bg-muted/10">
        <Link
          href="/dashboard/settings"
          className={cn(
            "w-full flex items-center rounded-md text-xs font-bold transition-all",
            showCollapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-2 justify-start",
            pathname === '/dashboard/settings'
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
          )}
          title={showCollapsed ? "Agency Settings" : undefined}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!showCollapsed && (
            <span className="animate-in fade-in duration-300">Agency Settings</span>
          )}
        </Link>
      </div>
    </aside>
  );
}
