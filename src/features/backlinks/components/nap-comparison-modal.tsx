'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { CitationListing } from '@prisma/client';

interface NapComparisonModalProps {
  citation: CitationListing;
  targetNap: {
    name: string;
    address: string;
    phone: string;
  };
}

export function NapComparisonModal({ citation, targetNap }: NapComparisonModalProps) {
  // Simulate directory found details based on match statuses
  const directoryNap = {
    name: citation.nameMatch ? targetNap.name : `${targetNap.name} Inc.`,
    address: citation.addressMatch ? targetNap.address : targetNap.address.replace('Suite', '#'),
    phone: citation.phoneMatch ? targetNap.phone : targetNap.phone.replace(/[^0-9]/g, '').slice(-10),
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-[10px] px-2">
          Compare NAP
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md text-xs">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold flex items-center gap-1.5">
            <Info className="h-4 w-4 text-blue-400" /> NAP Consistency Analysis
          </DialogTitle>
          <DialogDescription className="text-[10px]">
            Comparison for directory: <strong className="text-foreground">{citation.directoryName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted/20 border border-border/50 rounded-xl space-y-2">
              <h5 className="font-bold text-muted-foreground uppercase text-[9px] tracking-wider">Target NAP (Google Business Profile)</h5>
              <div className="space-y-1.5 text-[11px]">
                <div>
                  <span className="text-muted-foreground block text-[9px]">Business Name</span>
                  <span className="font-semibold text-foreground">{targetNap.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[9px]">Address</span>
                  <span className="font-semibold text-foreground">{targetNap.address}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[9px]">Phone</span>
                  <span className="font-semibold text-foreground">{targetNap.phone}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-muted/20 border border-border/50 rounded-xl space-y-2">
              <h5 className="font-bold text-muted-foreground uppercase text-[9px] tracking-wider">Directory NAP ({citation.directoryName})</h5>
              <div className="space-y-1.5 text-[11px]">
                <div>
                  <span className="text-muted-foreground block text-[9px]">Business Name</span>
                  <span className={`font-semibold flex items-center gap-1 ${citation.nameMatch ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {directoryNap.name}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[9px]">Address</span>
                  <span className={`font-semibold flex items-center gap-1 ${citation.addressMatch ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {directoryNap.address}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[9px]">Phone</span>
                  <span className={`font-semibold flex items-center gap-1 ${citation.phoneMatch ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {directoryNap.phone}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${citation.status === 'CONSISTENT' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/5 border-rose-500/20 text-rose-400'}`}>
            {citation.status === 'CONSISTENT' ? (
              <>
                <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-[10px] text-foreground">NAP Details are Consistent</span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">The name, address, and phone number match the Google Business Profile target settings.</span>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-[10px] text-foreground">NAP Mismatches Detected</span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">Correct details in the {citation.directoryName} portal to prevent search engine confusion.</span>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
