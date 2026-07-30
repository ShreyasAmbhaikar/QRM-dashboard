'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Globe, MapPin, Phone } from 'lucide-react';

interface GbpProfileCardProps {
  name: string;
  category: string;
  address: string;
  phone: string;
  websiteUrl: string;
  completenessScore: number;
}

export function GbpProfileCard({ name, category, address, phone, websiteUrl, completenessScore }: GbpProfileCardProps) {
  return (
    <Card className="border-border">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="space-y-1">
          <Badge variant="outline" className="text-[10px]">{category}</Badge>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" /> {name}
          </CardTitle>
        </div>
        <Badge variant={completenessScore >= 80 ? 'success' : 'outline'} className="font-mono text-sm">
          {completenessScore}% Complete
        </Badge>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4 text-rose-400 shrink-0" />
          <span className="truncate">{address}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{phone}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Globe className="h-4 w-4 text-blue-400 shrink-0" />
          <span className="truncate">{websiteUrl}</span>
        </div>
      </CardContent>
    </Card>
  );
}
