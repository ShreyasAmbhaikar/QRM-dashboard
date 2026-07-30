'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, Info, ExternalLink } from 'lucide-react';
import { Backlink } from '@prisma/client';

interface ToxicLinkAlertProps {
  backlinks: Backlink[];
}

export function ToxicLinkAlert({ backlinks }: ToxicLinkAlertProps) {
  const toxicLinks = backlinks.filter((b) => b.isToxic);

  if (toxicLinks.length === 0) {
    return (
      <Card className="border-border bg-emerald-500/5">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Clean Link Profile</h4>
            <p className="text-[10px] text-muted-foreground">No toxic or high-risk spam backlinks have been flagged for this domain.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-rose-500/20 bg-rose-500/5 text-xs">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-rose-500">
          <ShieldAlert className="h-4 w-4" /> Potential Toxic Backlinks Flagged ({toxicLinks.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-[10px] text-muted-foreground leading-normal">
          The following links are from domains with low domain authority, high outbound link density, or suspicious anchor patterns. Consider disavowing them in Google Search Console if they increase.
        </p>
        <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
          {toxicLinks.map((link) => (
            <div key={link.id} className="flex justify-between items-center p-2 rounded-lg bg-muted/20 border border-border/50">
              <div>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  {link.referringDomain} <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </span>
                <span className="text-[10px] text-muted-foreground block">Anchor: &ldquo;{link.anchorText || '—'}&rdquo;</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[9px] border-rose-500/30 text-rose-400 bg-rose-500/5 font-mono">
                  DA {link.domainAuthority}
                </Badge>
                <Badge variant="destructive" className="text-[9px] uppercase">
                  Spam/Toxic
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
