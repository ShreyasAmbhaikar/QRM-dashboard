'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Monitor, Smartphone } from 'lucide-react';

export function ScreenshotGallery() {
  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Playwright Viewport Capture Gallery</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="space-y-2 p-3 rounded-lg border border-border bg-muted/20">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <Monitor className="h-4 w-4 text-primary" /> Desktop Viewport (1920×1080)
          </span>
          <div className="h-40 rounded-md bg-slate-900 flex items-center justify-center text-muted-foreground font-mono text-[11px] border border-border">
            Desktop Render Captured
          </div>
        </div>

        <div className="space-y-2 p-3 rounded-lg border border-border bg-muted/20">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <Smartphone className="h-4 w-4 text-emerald-400" /> Mobile Viewport (375×812)
          </span>
          <div className="h-40 rounded-md bg-slate-900 flex items-center justify-center text-muted-foreground font-mono text-[11px] border border-border max-w-[200px] mx-auto">
            Mobile Render Captured
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
