'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useTheme } from 'next-themes';
import { useToast } from '@/components/ui/toast';
import { Palette, Sun, Moon, Laptop, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppearanceSelector() {
  const { theme, setTheme } = useTheme();
  const { info } = useToast();

  const handleSetTheme = (newTheme: string) => {
    setTheme(newTheme);
    const themeName = newTheme === 'light' ? 'Light Mode' : newTheme === 'dark' ? 'Obsidian Dark' : 'System Default';
    info('Theme Updated', `Switched application appearance to ${themeName}.`);
  };

  return (
    <Card className="border-border/80 text-xs shadow-sm">
      <CardHeader className="border-b border-border/50 pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" /> Appearance & Theme Mode
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Select your visual theme preference. Dark mode features a high-density obsidian/zinc palette, while Light mode provides crisp neutral workspace clarity.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Light Theme Card */}
          <button
            type="button"
            onClick={() => handleSetTheme('light')}
            className={cn(
              'p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between space-y-3 group',
              theme === 'light'
                ? 'border-primary ring-2 ring-primary/20 bg-muted/40 shadow-sm'
                : 'border-border/70 bg-card hover:border-border hover:bg-muted/20'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                <Sun className="h-5 w-5" />
              </div>
              {theme === 'light' && <Check className="h-4 w-4 text-primary" />}
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">Light Mode</h4>
              <p className="text-[11px] text-muted-foreground">Clean, high-contrast workspace clarity</p>
            </div>
          </button>

          {/* Dark Theme Card */}
          <button
            type="button"
            onClick={() => handleSetTheme('dark')}
            className={cn(
              'p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between space-y-3 group',
              theme === 'dark'
                ? 'border-primary ring-2 ring-primary/20 bg-muted/40 shadow-sm'
                : 'border-border/70 bg-card hover:border-border hover:bg-muted/20'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Moon className="h-5 w-5" />
              </div>
              {theme === 'dark' && <Check className="h-4 w-4 text-primary" />}
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">Obsidian Dark</h4>
              <p className="text-[11px] text-muted-foreground">Modern startup glassmorphic dark mode</p>
            </div>
          </button>

          {/* System Theme Card */}
          <button
            type="button"
            onClick={() => handleSetTheme('system')}
            className={cn(
              'p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between space-y-3 group',
              theme === 'system'
                ? 'border-primary ring-2 ring-primary/20 bg-muted/40 shadow-sm'
                : 'border-border/70 bg-card hover:border-border hover:bg-muted/20'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                <Laptop className="h-5 w-5" />
              </div>
              {theme === 'system' && <Check className="h-4 w-4 text-primary" />}
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">System Default</h4>
              <p className="text-[11px] text-muted-foreground">Match OS color scheme preferences</p>
            </div>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
