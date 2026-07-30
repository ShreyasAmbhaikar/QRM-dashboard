import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, HelpCircle, FileText } from 'lucide-react';

interface SerpFeatureTagProps {
  feature: 'LOCAL_PACK' | 'FEATURED_SNIPPET' | 'PAA' | 'REVIEWS';
}

export function SerpFeatureTag({ feature }: SerpFeatureTagProps) {
  switch (feature) {
    case 'LOCAL_PACK':
      return (
        <Badge variant="outline" className="text-[9px] gap-1 bg-red-500/10 text-red-400 border-red-500/20">
          <MapPin className="h-2.5 w-2.5" /> Map Pack
        </Badge>
      );
    case 'FEATURED_SNIPPET':
      return (
        <Badge variant="outline" className="text-[9px] gap-1 bg-amber-500/10 text-amber-400 border-amber-500/20">
          <Star className="h-2.5 w-2.5" /> Snippet
        </Badge>
      );
    case 'PAA':
      return (
        <Badge variant="outline" className="text-[9px] gap-1 bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
          <HelpCircle className="h-2.5 w-2.5" /> PAA
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-[9px] gap-1">
          <FileText className="h-2.5 w-2.5" /> Organic
        </Badge>
      );
  }
}
