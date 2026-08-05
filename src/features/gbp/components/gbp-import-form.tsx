'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { GbpLocationDetails } from '@/lib/api/gbp';
import { Client } from '@prisma/client';
import { importGbpLocations } from '../actions';
import { useRouter } from 'next/navigation';
import { Check, Info, ShieldAlert, ArrowRight, Building, Globe, MapPin, Phone } from 'lucide-react';

interface GbpImportFormProps {
  connectionId: string;
  locations: GbpLocationDetails[];
  clients: Client[];
}

export function GbpImportForm({ connectionId, locations, clients }: GbpImportFormProps) {
  const router = useRouter();
  const { success, error, info } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(locations.map((loc) => loc.locationId));
  const [mappings, setMappings] = useState<Record<string, string>>(
    locations.reduce((acc, loc) => {
      // Try to find a client with a similar name, otherwise set to 'NEW'
      const match = clients.find((c) => c.name.toLowerCase() === loc.name.toLowerCase());
      acc[loc.locationId] = match ? match.id : 'NEW';
      return acc;
    }, {} as Record<string, string>)
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === locations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(locations.map((loc) => loc.locationId));
    }
  };

  const handleMappingChange = (locationId: string, value: string) => {
    setMappings((prev) => ({ ...prev, [locationId]: value }));
  };

  const handleImport = async () => {
    if (selectedIds.length === 0) {
      error('No Selection', 'Please select at least one location to import.');
      return;
    }

    setLoading(false);
    setLoading(true);
    info('Connecting Profiles', `Integrating ${selectedIds.length} location(s)...`);

    const selections = locations
      .filter((loc) => selectedIds.includes(loc.locationId))
      .map((loc) => ({
        locationId: loc.locationId,
        name: loc.name,
        websiteUrl: loc.websiteUrl,
        clientMapping: mappings[loc.locationId] || 'NEW',
      }));

    try {
      const res = await importGbpLocations(connectionId, selections);

      if (res.success) {
        success('Success', `Successfully imported ${res.data.importedCount} business profiles.`);
        router.push('/dashboard/gbp');
        router.refresh();
      } else {
        error('Import Failed', res.error.message || 'An error occurred during import.');
        setLoading(false);
      }
    } catch (err) {
      error('Database Error', 'An unexpected error occurred while linking profiles.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto select-none">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-xl bg-card border border-border p-6 shadow-sm">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
          <div className="space-y-2">
            <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary text-[10px] px-2">
              Sync Wizard
            </Badge>
            <h1 className="text-xl font-bold tracking-tight">Select Listings to Manage</h1>
            <p className="text-xs text-muted-foreground max-w-xl">
              We found {locations.length} business locations associated with the connected Google account. Choose which listings you want to link or import to your QRM Dashboard.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/gbp')} className="text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={loading}
              onClick={handleImport}
              className="gap-2 shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold"
            >
              {loading ? 'Connecting...' : `Connect ${selectedIds.length} Listings`}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {locations.length === 0 ? (
        <Card className="border-border p-12 text-center">
          <ShieldAlert className="h-10 w-10 text-amber-500 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-foreground mb-1">No Listings Found</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            This Google account does not own or manage any Google Business Profiles. Please make sure you connected the correct account or created business profiles on Google.
          </p>
          <Button variant="outline" size="sm" className="mt-4 text-xs" onClick={() => router.push('/dashboard/gbp')}>
            Back to Overview
          </Button>
        </Card>
      ) : (
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border/50 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold">Listings ({locations.length})</CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground">Select and configure the mapping settings for each location.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={toggleSelectAll} className="text-xs text-primary hover:text-primary/80">
              {selectedIds.length === locations.length ? 'Deselect All' : 'Select All'}
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {locations.map((loc) => {
                const isSelected = selectedIds.includes(loc.locationId);
                return (
                  <div
                    key={loc.locationId}
                    className={`flex flex-col md:flex-row items-start md:items-center justify-between p-5 gap-4 transition-colors ${
                      isSelected ? 'bg-primary/5' : 'hover:bg-muted/10'
                    }`}
                  >
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="pt-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(loc.locationId)}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary bg-card focus:ring-offset-background"
                        />
                      </div>
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-foreground truncate">{loc.name}</span>
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                            {loc.primaryCategory}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate">{loc.address}</span>
                          </div>
                          {loc.phone && loc.phone !== 'No Phone' && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span>{loc.phone}</span>
                            </div>
                          )}
                          {loc.websiteUrl && (
                            <div className="flex items-center gap-1.5 col-span-full mt-0.5">
                              <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <a
                                href={loc.websiteUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline truncate"
                              >
                                {loc.websiteUrl}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-64 space-y-1 md:shrink-0">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                        Link Location To:
                      </label>
                      <select
                        disabled={!isSelected}
                        value={mappings[loc.locationId] || 'NEW'}
                        onChange={(e) => handleMappingChange(loc.locationId, e.target.value)}
                        className={`h-8 rounded-md border border-border bg-card px-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary w-full ${
                          !isSelected ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <option value="NEW">Create new client profile</option>
                        <optgroup label="Link to existing client">
                          {clients.map((client) => (
                            <option key={client.id} value={client.id}>
                              {client.name} ({client.domain})
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
