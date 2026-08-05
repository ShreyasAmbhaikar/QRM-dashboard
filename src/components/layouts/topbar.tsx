'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sun,
  Moon,
  Search,
  LogOut,
  Command,
  ChevronDown,
  Settings,
  User,
  Plus,
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { NotificationBell } from '@/features/notifications/components/notification-bell';
import { getConnectedClientsAction, setActiveClientAction } from '@/features/gbp/actions';
import Link from 'next/link';

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const user = session?.user;
  const [mounted, setMounted] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return undefined;
  };

  useEffect(() => {
    setMounted(true);
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchClients = async () => {
      const res = await getConnectedClientsAction();
      if (res.success && res.data) {
        setClients(res.data);
        const activeId = getCookie('gbp_active_client');
        if (activeId && res.data.some(c => c.id === activeId)) {
          setSelectedClientId(activeId);
        } else if (res.data.length > 0) {
          const firstId = res.data[0]?.id;
          if (firstId) {
            setSelectedClientId(firstId);
            await setActiveClientAction(firstId);
          }
        }
      }
    };
    if (status === 'authenticated') {
      fetchClients();
    }
  }, [status, pathname]);

  const handleClientChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedClientId(val);
    await setActiveClientAction(val);

    if (pathname.startsWith('/dashboard/gbp/')) {
      const pathParts = pathname.split('/');
      pathParts[3] = val;
      router.push(pathParts.join('/'));
    } else if (pathname === '/dashboard/gbp') {
      router.push(`/dashboard/gbp/${val}`);
    } else {
      router.refresh();
    }
  };

  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  const breadcrumbText = lastSegment
    ? lastSegment.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
    : 'Overview';

  const formatRole = (role: string) => {
    return role.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
  };

  const firstLetter = user?.name?.charAt(0).toUpperCase() || 'U';

  return (
    <header className="h-14 border-b border-border bg-card px-6 md:px-8 flex items-center justify-between sticky top-0 z-20 select-none">
      {/* Global Active Profile Switcher or Connect Button (Left Side) */}
      <div className="flex items-center gap-2 text-xs">
        {mounted && (
          <div className="flex items-center gap-2">
            {clients.length > 0 ? (
              <>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  Active Listing:
                </span>
                <div className="relative min-w-[180px] max-w-[240px]">
                  <select
                    value={selectedClientId}
                    onChange={handleClientChange}
                    className="h-8 pl-2.5 pr-8 rounded-lg border border-border bg-muted/40 hover:bg-muted/70 text-xs text-foreground font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary w-full cursor-pointer appearance-none shadow-sm transition-all"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        🏢 {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/75">
                    <ChevronDown className="h-3 w-3" />
                  </div>
                </div>
                <a
                  href="/api/integrations/google/connect?clientId=import"
                  title="Connect another Google Account"
                  className="h-8 w-8 flex items-center justify-center rounded-lg border border-border bg-muted/40 hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-all shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                </a>
              </>
            ) : (
              <a
                href="/api/integrations/google/connect?clientId=import"
                className="h-8 px-3 flex items-center gap-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-sm transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Connect Google Account</span>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Action Controls & Utilities (Right Side) */}
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

        {/* User Account Menu Dropdown */}
        {mounted && status === 'authenticated' && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-muted/50 border border-transparent hover:border-border transition-all focus:outline-none cursor-pointer"
              aria-expanded={isOpen}
              aria-haspopup="true"
            >
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name || 'User Profile'}
                  className="h-7 w-7 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/25 text-primary flex items-center justify-center text-xs font-bold font-sans">
                  {firstLetter}
                </div>
              )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
              <div className="absolute right-0 top-10 mt-1 w-56 rounded-lg border border-border bg-card shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* User Identity Info */}
                <div className="px-2.5 py-2">
                  <p className="text-xs font-bold text-foreground truncate">{user?.name || 'User Account'}</p>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">{user?.email || ''}</p>
                  {user?.role && (
                    <span className="inline-block text-[9px] font-bold tracking-wide uppercase px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary mt-1.5">
                      {formatRole(user.role)}
                    </span>
                  )}
                </div>

                <div className="h-px bg-border/60 my-1" />

                {/* Menu Options */}
                <div className="space-y-0.5">
                  <Link
                    href="/dashboard/settings/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 w-full text-left px-2.5 py-1.5 rounded-md hover:bg-muted/80 text-xs font-medium text-foreground transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Account Settings</span>
                  </Link>
                  
                  <div className="h-px bg-border/40 my-1" />

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      signOut({ callbackUrl: '/login' });
                    }}
                    className="flex items-center gap-2 w-full text-left px-2.5 py-1.5 rounded-md hover:bg-rose-950/20 hover:text-rose-400 text-xs font-medium text-muted-foreground transition-colors cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
