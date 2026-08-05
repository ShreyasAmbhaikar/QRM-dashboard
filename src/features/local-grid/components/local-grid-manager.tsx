'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LeafletMap } from './leaflet-map';
import { GridPoint, CompetitorListing } from '../grid-calculator';
import { 
  CompetitorLeaderboardItem, 
  calculateCompetitorLeaderboard 
} from '../metrics';
import { 
  enqueueLocalGridScan, 
  getGridScanStatus, 
  getCompletedGrids, 
  getGridScanHistory, 
  deleteGridScan 
} from '../actions';
import { geocodeAddress } from '../geocoder';
import { generateGridPoints } from '../grid-calculator';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { 
  MapPin, Search, Download, RefreshCw, Trash2, 
  History, TrendingUp, Users, AlertTriangle,
  ChevronRight, ExternalLink, Calendar, Layers, Activity,
  Plus, CheckCircle2, Locate, Landmark, Check, X, Pencil
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface LocalGridManagerProps {
  clientId: string;
  clientName: string;
  clientDomain?: string;
  initialHistory?: any[];
  hasGbpConnected?: boolean;
}

// Preset locations centered around Pune, India
const PRESET_LOCATIONS = [
  {
    id: 'dr-varun',
    name: "Dr. Varun's Dental Clinic (Viman Nagar)",
    address: "Shop no 3, Ideal Landmark, Besides PNG Jewellers, Viman Nagar, Pune, Maharashtra 411014",
    lat: 18.565329,
    lng: 73.9167066,
    domain: "drvarunsdentalclinic.com",
    placeId: "ChIJy2e350bBwj0Rug22s_VZxII"
  },
  {
    id: 'deccan-dental',
    name: "Deccan Dental Clinic (Kasba Peth)",
    address: "Deccan Gymkhana, Shivajinagar, Pune, Maharashtra 411004",
    lat: 18.5168,
    lng: 73.8415,
    domain: "deccandental.com",
    placeId: "ChIJdeccandental123"
  },
  {
    id: 'kalyani-nagar',
    name: "Kalyani Nagar Dental Care (Kalyani Nagar)",
    address: "Kalyani Nagar, Pune, Maharashtra 411006",
    lat: 18.5463,
    lng: 73.9033,
    domain: "kalyanidental.com",
    placeId: "ChIJkalyanidental456"
  },
  {
    id: 'kp-smile',
    name: "Koregaon Park Smile Studio (Koregaon Park)",
    address: "Koregaon Park, Pune, Maharashtra 411001",
    lat: 18.5362,
    lng: 73.8930,
    domain: "kpsmilestudio.com",
    placeId: "ChIJsmilestudio789"
  },
  {
    id: 'custom',
    name: "Custom Target...",
    address: "",
    lat: 18.565329,
    lng: 73.9167066,
    domain: "",
    placeId: ""
  }
];

export function LocalGridManager({ 
  clientId, 
  clientName, 
  clientDomain, 
  initialHistory = [],
  hasGbpConnected = false,
}: LocalGridManagerProps) {
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
  
  // Tab states
  const [activeTab, setActiveTab] = useState<'scan' | 'history'>('scan');
  
  // Location Selection state
  const [selectedLocationId, setSelectedLocationId] = useState('dr-varun');
  
  // Form states
  const [addressInput, setAddressInput] = useState(PRESET_LOCATIONS[0]!.address);
  const [centerLat, setCenterLat] = useState(PRESET_LOCATIONS[0]!.lat);
  const [centerLng, setCenterLng] = useState(PRESET_LOCATIONS[0]!.lng);
  const [gridSize, setGridSize] = useState<3 | 5 | 7>(5);
  const [radiusMiles, setRadiusMiles] = useState<number>(0.6); // 1 km approx
  const [geocoder, setGeocoder] = useState<'google' | 'nominatim' | 'mapbox'>('nominatim');

  
  // Competitor settings
  const [customName, setCustomName] = useState(PRESET_LOCATIONS[0]!.name);
  const [customDomain, setCustomDomain] = useState(PRESET_LOCATIONS[0]!.domain);
  const [customPlaceId, setCustomPlaceId] = useState(PRESET_LOCATIONS[0]!.placeId);

  // Bulk keywords state builder
  const [keywordsList, setKeywordsList] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [editingKeywordIndex, setEditingKeywordIndex] = useState<number | null>(null);
  const [editingKeywordValue, setEditingKeywordValue] = useState<string>('');

  // Scanning progress states
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatusMessage, setScanStatusMessage] = useState('');
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // Loaded Scan Results (Grids)
  const [scanResults, setScanResults] = useState<any[]>([]);
  const [activeGridIndex, setActiveGridIndex] = useState<number>(0);
  
  // Interaction states
  const [selectedPoint, setSelectedPoint] = useState<GridPoint | null>(null);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const [activeCompetitorPlaceId, setActiveCompetitorPlaceId] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<CompetitorLeaderboardItem[]>([]);

  // History list
  const [historyList, setHistoryList] = useState<any[]>(initialHistory);

  // Auto-fill form values on target location changes
  const handleLocationChange = (locId: string) => {
    setSelectedLocationId(locId);
    const loc = PRESET_LOCATIONS.find(l => l.id === locId);
    if (!loc) return;
    
    if (locId !== 'custom') {
      setAddressInput(loc.address);
      setCenterLat(loc.lat);
      setCenterLng(loc.lng);
      setCustomName(loc.name);
      setCustomDomain(loc.domain);
      setCustomPlaceId(loc.placeId);
    } else {
      setAddressInput('');
      setCustomName('');
      setCustomDomain('');
      setCustomPlaceId('');
    }
  };

  // Real-time grid points preview calculation for map overlays
  const previewPoints = useMemo(() => {
    if (!centerLat || !centerLng) return [];
    return generateGridPoints({ lat: centerLat, lng: centerLng }, gridSize, radiusMiles);
  }, [centerLat, centerLng, gridSize, radiusMiles]);

  // Geocode custom addresses client-side on Locate click
  const handleLocateAddress = async () => {
    if (!addressInput) {
      toastError('Input required', 'Please enter an address first');
      return;
    }
    toastInfo('Locating', 'Resolving coordinates from geocoder...');
    try {
      const coords = await geocodeAddress(addressInput, geocoder);
      setCenterLat(coords.lat);
      setCenterLng(coords.lng);
      toastSuccess('Located', 'Map coordinates centered successfully.');
    } catch (err) {
      toastError('Geocoding Failed', 'Could not locate address. Check geocoder settings.');
    }
  };

  // Refresh Scan History
  const fetchHistory = async () => {
    const res = await getGridScanHistory(clientId);
    if (res.success && res.data) {
      setHistoryList(res.data);
    }
  };

  // Handle Bulk Keywords Builder
  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    const val = keywordInput.trim();
    if (!val) return;
    if (keywordsList.includes(val)) {
      toastError('Duplicate', 'Keyword already added to list');
      return;
    }
    setKeywordsList([...keywordsList, val]);
    setKeywordInput('');
  };

  const handleRemoveKeyword = (index: number) => {
    setKeywordsList(keywordsList.filter((_, i) => i !== index));
    if (editingKeywordIndex === index) {
      setEditingKeywordIndex(null);
    }
  };

  const handleSaveEditedKeyword = (index: number) => {
    const val = editingKeywordValue.trim();
    if (!val) return;
    if (keywordsList.includes(val) && keywordsList[index] !== val) {
      toastError('Duplicate', 'Keyword already exists in the list.');
      return;
    }
    const updated = [...keywordsList];
    updated[index] = val;
    setKeywordsList(updated);
    setEditingKeywordIndex(null);
  };

  // Submit scan job
  const handleStartScan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (keywordsList.length === 0) {
      toastError('Validation Error', 'Please enter at least one target keyword.');
      return;
    }

    setIsScanning(true);
    setScanProgress(5);
    setScanStatusMessage('Initiating scan engine...');
    setSelectedPoint(null);
    setSelectedPointIndex(null);
    setActiveCompetitorPlaceId(null);

    const payload = {
      clientId,
      keywords: keywordsList,
      address: addressInput || undefined,
      centerLat,
      centerLng,
      gridSize,
      radiusMiles,
      geocoder,
      isCustomSearch: true,
      targetPlaceId: customPlaceId || undefined,
      targetName: customName || clientName,
      targetDomain: customDomain || clientDomain,
    };

    const res = await enqueueLocalGridScan(payload);

    if (res.success) {
      if (res.data?.gridIds) {
        // Direct synchronous response (Instant simulator)
        setScanStatusMessage('Scan completed! Fetching coordinates...');
        setScanProgress(100);
        
        const gridRecordsRes = await getCompletedGrids(res.data.gridIds);
        if (gridRecordsRes.success && gridRecordsRes.data) {
          setScanResults(gridRecordsRes.data);
          setActiveGridIndex(0);
          setIsScanning(false);
          setActiveJobId(null);
          toastSuccess('Success', `Completed ranking scan for ${gridRecordsRes.data.length} keyword(s).`);
          fetchHistory();
        }
      } else if (res.data?.jobId) {
        // BullMQ asynchronous queue worker fallback
        setActiveJobId(res.data.jobId);
        setScanStatusMessage('Scan job enqueued in background. Waiting for worker...');
      }
    } else {
      setIsScanning(false);
      toastError('Scan Initiation Failed', res.error.message || 'Check connection details.');
    }
  };

  // Silence html2canvas color parsing warnings and errors globally for this component session
  useEffect(() => {
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    const filterWarning = (args: any[]) => {
      const errorString = args.map(arg => {
        if (!arg) return '';
        if (arg instanceof Error) return arg.message + ' ' + (arg.stack || '');
        if (typeof arg === 'object') {
          try { return JSON.stringify(arg); } catch { return ''; }
        }
        return String(arg);
      }).join(' ');

      return errorString.includes('unsupported color function') || 
             errorString.includes('unsupported color') ||
             errorString.includes('unsupported color function "lab"');
    };

    console.error = (...args) => {
      if (filterWarning(args)) return;
      originalConsoleError.apply(console, args);
    };

    console.warn = (...args) => {
      if (filterWarning(args)) return;
      originalConsoleWarn.apply(console, args);
    };

    return () => {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, []);

  // Poll background scan jobs (if any queued)
  useEffect(() => {
    if (!isScanning || !activeJobId) return;

    let intervalId = setInterval(async () => {
      const res = await getGridScanStatus(activeJobId);
      if (!res.success) return;

      const job = res.data;
      if (job) {
        setScanProgress(job.progress);
        
        if (job.status === 'active') {
          setScanStatusMessage(`Worker active: Scraping maps coordinates (${job.progress}%)`);
        } else if (job.status === 'completed' && job.result?.gridIds) {
          clearInterval(intervalId);
          setScanStatusMessage('Scan completed successfully! Loading dataset...');
          
          const gridRecordsRes = await getCompletedGrids(job.result.gridIds);
          if (gridRecordsRes.success && gridRecordsRes.data) {
            setScanResults(gridRecordsRes.data);
            setActiveGridIndex(0);
            setIsScanning(false);
            setActiveJobId(null);
            
            toastSuccess('Success', `Completed ranking scan for ${gridRecordsRes.data.length} keyword(s).`);
            fetchHistory();
          }
        } else if (job.status === 'failed') {
          clearInterval(intervalId);
          setIsScanning(false);
          setActiveJobId(null);
          setScanProgress(0);
          toastError('Scan failed', job.error || 'Scraper rate limit exceeded.');
        }
      }
    }, 2000);

    return () => clearInterval(intervalId);
  }, [isScanning, activeJobId]);

  // Update Competitor Leaderboard
  useEffect(() => {
    if (scanResults.length === 0 || !scanResults[activeGridIndex]) {
      setLeaderboard([]);
      return;
    }

    const grid = scanResults[activeGridIndex];
    const points: GridPoint[] = typeof grid.gridPoints === 'string' 
      ? JSON.parse(grid.gridPoints) 
      : grid.gridPoints;

    const board = calculateCompetitorLeaderboard(points, {
      placeId: grid.targetPlaceId || undefined,
      name: grid.targetName || undefined,
      domain: grid.targetDomain || undefined,
    });

    setLeaderboard(board);
    
    // Default select center point
    const halfSize = Math.floor(grid.gridSize / 2);
    const centerIndex = points.findIndex(p => p.row === halfSize && p.col === halfSize);
    if (centerIndex !== -1 && points[centerIndex]) {
      setSelectedPoint(points[centerIndex]!);
      setSelectedPointIndex(centerIndex);
    }
  }, [scanResults, activeGridIndex]);

  // Load from Scan History
  const handleLoadHistoryScan = (grid: any) => {
    setScanResults([grid]);
    setActiveGridIndex(0);
    setActiveTab('scan');
    setSelectedPoint(null);
    setSelectedPointIndex(null);
    setActiveCompetitorPlaceId(null);
    toastInfo('Scan loaded', `Viewing historical scan from ${new Date(grid.createdAt).toLocaleDateString()}`);
  };

  // Delete Scan Snapshot
  const handleDeleteScan = async (gridId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this historical grid snapshot?')) return;

    const res = await deleteGridScan(gridId);
    if (res.success) {
      toastSuccess('Deleted', 'Scan snapshot removed.');
      fetchHistory();
    } else {
      toastError('Delete failed', res.error?.message || 'Permissions error');
    }
  };

  // Simple map screenshot exporter using html2canvas with computed style Proxy fix for modern colors
  const handleExportPNG = async () => {
    const mapWrapper = document.querySelector('.relative.w-full.aspect-video') as HTMLElement;
    if (!mapWrapper) return;

    const originalGetComputedStyle = window.getComputedStyle;

    try {
      // Find and temporarily hide the map controls overlay during snapshot (hides the camera/theme buttons)
      const controls = mapWrapper.querySelector('.absolute.top-4.right-4') as HTMLElement;
      if (controls) controls.style.display = 'none';

      // Keep the floating keyword dropdown overlay visible so it is included in the captured report image

      // Set up the getComputedStyle Proxy during html2canvas execution to filter out oklch/lab colors
      const convertColor = (val: string) => {
        if (!val) return val;
        if (val.includes('oklch(') || val.includes('lab(')) {
          // Return transparent color so html2canvas ignores modern color syntax
          return 'rgba(0, 0, 0, 0)';
        }
        return val;
      };

      window.getComputedStyle = function (elt, pseudoElt) {
        const style = originalGetComputedStyle(elt, pseudoElt);
        return new Proxy(style, {
          get(target, prop) {
            if (prop === 'getPropertyValue') {
              return function(propertyName: string) {
                return convertColor(target.getPropertyValue(propertyName));
              };
            }
            const val = Reflect.get(target, prop);
            if (typeof val === 'string') {
              return convertColor(val);
            }
            if (typeof val === 'function') {
              return val.bind(target);
            }
            return val;
          }
        });
      };

      // Wait a brief moment to allow DOM style update
      await new Promise((resolve) => setTimeout(resolve, 150));

      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(mapWrapper, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#020617', // dark slate background matching our theme
        scale: 2, // 2x quality scaler for crisp PNG exports
        logging: false, // Turn off html2canvas internal logs
      });

      // Restore custom controls display
      if (controls) controls.style.display = 'flex';

      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `GeoGrid_Scan_${activeGrid?.keyword.replace(/[^a-z0-9]/gi, '_') || 'report'}.png`;
      link.href = url;
      link.click();
    } catch (err) {
      console.error('Failed to capture map screenshot:', err);
    } finally {
      window.getComputedStyle = originalGetComputedStyle;
    }
  };

  const activeGrid = scanResults[activeGridIndex];
  const activeGridPoints: GridPoint[] = activeGrid
    ? (typeof activeGrid.gridPoints === 'string' ? JSON.parse(activeGrid.gridPoints) : activeGrid.gridPoints)
    : [];

  return (
    <div className="space-y-6 select-none">
      {/* Tab controls */}
      <div className="flex border-b border-border bg-card/25 p-1 rounded-t-xl gap-2 text-xs">
        <button
          onClick={() => setActiveTab('scan')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold transition-all border border-transparent ${activeTab === 'scan' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'}`}
        >
          <Activity className="h-3.5 w-3.5" />
          <span>Local Geo-Grid Scan</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold transition-all border border-transparent ${activeTab === 'history' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'}`}
        >
          <History className="h-3.5 w-3.5" />
          <span>Scan History ({historyList.length})</span>
        </button>
      </div>

      {activeTab === 'scan' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* parameters controls sidebar card */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-card/60 border-border">
              <CardHeader className="py-4 border-b border-border/60">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-primary" /> Grid Configuration
                </CardTitle>
                <CardDescription className="text-[11px]">
                  Select target dental clinics and configure bulk keyword list options.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleStartScan} className="space-y-4 text-xs">
                  {/* Target Location Dropdown */}
                  <div className="space-y-1">
                    <label className="text-muted-foreground font-semibold">Target Location</label>
                    <select
                      value={selectedLocationId}
                      onChange={(e) => handleLocationChange(e.target.value)}
                      className="w-full rounded-md border border-input bg-background p-2 text-xs text-foreground font-semibold cursor-pointer focus-visible:outline-none"
                    >
                      {PRESET_LOCATIONS.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          🏢 {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>



                  {/* Geocoder Selector */}
                  <div className="space-y-1">
                    <label className="text-muted-foreground">Geocoding Provider</label>
                    <select
                      value={geocoder}
                      onChange={(e) => setGeocoder(e.target.value as any)}
                      className="w-full rounded-md border border-input bg-background p-2 text-xs text-foreground cursor-pointer focus-visible:outline-none"
                    >
                      <option value="nominatim">🌍 Nominatim OpenStreetMap (100% Free)</option>
                      <option value="google">💼 Google Geocoding (Rooftop accuracy)</option>
                      <option value="mapbox">🗺️ Mapbox Geocoding (Fast & Precise)</option>
                    </select>
                  </div>

                  {/* Center Address input */}
                  <div className="space-y-1">
                    <label className="text-muted-foreground font-semibold">Center Address / Location</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        required
                        value={addressInput}
                        onChange={(e) => setAddressInput(e.target.value)}
                        placeholder="e.g. 123 Main St, Chicago, IL"
                        className="flex-1 rounded-md border border-input bg-background p-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={handleLocateAddress}
                        className="px-2 border border-border bg-slate-900 hover:bg-slate-800 rounded-md text-slate-100 flex items-center justify-center cursor-pointer transition-all"
                        title="Geocode address coordinates on map"
                      >
                        <Locate className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Bulk keywords input tab builder */}
                  <div className="space-y-2.5">
                    <label className="text-muted-foreground font-semibold flex justify-between">
                      <span>Target Keywords (Bulk)</span>
                      <span className="text-[10px] text-muted-foreground/60">{keywordsList.length} terms</span>
                    </label>
                    
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddKeyword(e);
                          }
                        }}
                        placeholder="Input a keyword and press enter"
                        className="flex-1 rounded-md border border-input bg-background p-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={handleAddKeyword}
                        className="px-3 border border-border bg-slate-900 hover:bg-slate-800 rounded-md text-slate-100 font-bold flex items-center justify-center cursor-pointer transition-all"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Keywords List below */}
                    {keywordsList.length > 0 ? (
                      <div className="flex flex-col gap-1.5 p-2.5 bg-slate-950/40 rounded-lg border border-border max-h-[150px] overflow-y-auto scrollbar-thin">
                        {keywordsList.map((kw, index) => (
                          <div 
                            key={index} 
                            className="flex items-center justify-between px-2.5 py-1.5 bg-card border border-border/80 rounded-md text-[11px] font-medium gap-2"
                          >
                            {editingKeywordIndex === index ? (
                              <div className="flex items-center gap-1.5 w-full">
                                <input
                                  type="text"
                                  value={editingKeywordValue}
                                  onChange={(e) => setEditingKeywordValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleSaveEditedKeyword(index);
                                    } else if (e.key === 'Escape') {
                                      setEditingKeywordIndex(null);
                                    }
                                  }}
                                  className="flex-1 bg-background border border-input rounded px-1.5 py-0.5 text-xs text-foreground focus-visible:outline-none"
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditedKeyword(index)}
                                  className="text-emerald-400 hover:text-emerald-300 p-0.5 cursor-pointer flex-shrink-0"
                                  title="Save change"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingKeywordIndex(null)}
                                  className="text-muted-foreground hover:text-slate-300 p-0.5 cursor-pointer flex-shrink-0"
                                  title="Cancel"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-2 truncate pr-2">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveKeyword(index)}
                                    className="text-muted-foreground hover:text-red-400 p-0.5 cursor-pointer transition-all flex-shrink-0"
                                    title="Delete keyword"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                  <span className="truncate">{kw}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingKeywordIndex(index);
                                    setEditingKeywordValue(kw);
                                  }}
                                  className="text-muted-foreground hover:text-primary p-0.5 cursor-pointer transition-all flex-shrink-0"
                                  title="Rename keyword"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-muted-foreground/60 italic px-1">No keywords added yet. Scan requires at least one.</p>
                    )}
                  </div>

                  {/* Grid Size and Node distance */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-muted-foreground font-semibold">Grid Size</label>
                      <select
                        value={gridSize}
                        onChange={(e) => setGridSize(Number(e.target.value) as any)}
                        className="w-full rounded-md border border-input bg-background p-2 text-xs text-foreground cursor-pointer focus-visible:outline-none"
                      >
                        <option value={3}>3 × 3 (9 pts)</option>
                        <option value={5}>5 × 5 (25 pts)</option>
                        <option value={7}>7 × 7 (49 pts)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-muted-foreground font-semibold">Node Distance</label>
                      <select
                        value={radiusMiles}
                        onChange={(e) => setRadiusMiles(Number(e.target.value))}
                        className="w-full rounded-md border border-input bg-background p-2 text-xs text-foreground cursor-pointer focus-visible:outline-none"
                      >
                        <option value={0.3}>500 meters</option>
                        <option value={0.6}>1 km</option>
                        <option value={1.2}>2 km</option>
                        <option value={3.1}>5 km</option>
                        <option value={6.2}>10 km</option>
                      </select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isScanning || keywordsList.length === 0}
                    className="w-full h-10 text-xs font-semibold cursor-pointer"
                  >
                    {isScanning ? (
                      <span className="flex items-center gap-1.5 justify-center">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Running Scan...
                      </span>
                    ) : (
                      'Run Bulk GeoGrid Scan'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Scanning progress log */}
            {isScanning && (
              <Card className="border-border bg-slate-950/50">
                <CardContent className="py-4 space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-primary">Worker Active Progress</span>
                    <span className="text-muted-foreground">{scanProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500 shadow-[0_0_8px_#3b82f6]"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                  <div className="flex gap-2 items-start text-[10px] text-muted-foreground">
                    <Activity className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{scanStatusMessage}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Map Viewer & Leaderboards Panel */}
          <div className="lg:col-span-2 space-y-6">
            {scanResults.length > 0 && activeGrid ? (
              <div className="space-y-6">
                {/* Header controls removed - bulk keyword selector is now overlayed directly on Leaflet Map container */}

                {/* Whitespark stats card metrics grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-emerald-500/20 bg-emerald-500/5 backdrop-blur">
                    <CardContent className="py-4">
                      <span className="text-[10px] font-bold tracking-wider text-emerald-400 block uppercase">Visibility Score</span>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-3xl font-extrabold text-white font-mono">{activeGrid.visibilityScore}%</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1.5">Weighted metric based on Top 1-20 Map Pack presence.</p>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-500/20 bg-blue-500/5 backdrop-blur">
                    <CardContent className="py-4">
                      <span className="text-[10px] font-bold tracking-wider text-blue-400 block uppercase">Average Ranking</span>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-3xl font-extrabold text-white font-mono">{activeGrid.avgRank}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1.5">Average map pack ranking of all grid coordinates.</p>
                    </CardContent>
                  </Card>

                  <Card className="border-amber-500/20 bg-amber-500/5 backdrop-blur">
                    <CardContent className="py-4">
                      <span className="text-[10px] font-bold tracking-wider text-amber-400 block uppercase">Relative Review Score</span>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-3xl font-extrabold text-white font-mono">{activeGrid.relativeReviewScore}%</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1.5">Reviews and rating performance compared to grid competitors.</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Interactive Leaflet Map Visualizer */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2 space-y-3">
                    {activeCompetitorPlaceId && (
                      <div className="bg-amber-950/20 border border-amber-500/30 text-amber-300 p-2 rounded-lg flex items-center justify-between text-[10px]">
                        <span>
                          Viewing heatmap of competitor: <strong>{leaderboard.find(c => c.placeId === activeCompetitorPlaceId || c.cid === activeCompetitorPlaceId)?.name}</strong>
                        </span>
                        <button
                          onClick={() => setActiveCompetitorPlaceId(null)}
                          className="font-bold underline hover:text-amber-100 cursor-pointer"
                        >
                          Reset to Client
                        </button>
                      </div>
                    )}
                    <LeafletMap
                      center={{ lat: activeGrid.centerLat, lng: activeGrid.centerLng }}
                      points={activeGridPoints}
                      gridSize={activeGrid.gridSize}
                      onPointClick={(pt, idx) => {
                        setSelectedPoint(pt);
                        setSelectedPointIndex(idx);
                      }}
                      selectedPointIndex={selectedPointIndex}
                      activeCompetitorPlaceId={activeCompetitorPlaceId}
                      onScreenshot={handleExportPNG}
                      keywords={scanResults.map((grid) => grid.keyword)}
                      activeKeywordIndex={activeGridIndex}
                      onKeywordChange={(idx) => {
                        setActiveGridIndex(idx);
                        setSelectedPoint(null);
                        setSelectedPointIndex(null);
                        setActiveCompetitorPlaceId(null);
                      }}
                    />
                  </div>

                  {/* Coordinate Competitor Listings */}
                  <div className="xl:col-span-1">
                    <Card className="h-[380px] flex flex-col border-border bg-slate-950/30">
                      <CardHeader className="py-3.5 border-b border-border/60">
                        <CardTitle className="text-xs flex items-center gap-1.5 font-bold">
                          <Users className="h-3.5 w-3.5 text-primary" /> Competitors at Point
                        </CardTitle>
                        {selectedPoint && (
                          <CardDescription className="text-[10px] font-mono mt-0.5">
                            Lat: {selectedPoint.lat.toFixed(4)}°, Lng: {selectedPoint.lng.toFixed(4)}°
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="flex-1 overflow-y-auto p-2.5 space-y-1.5 scrollbar-thin">
                        {selectedPoint && selectedPoint.results && selectedPoint.results.length > 0 ? (
                          selectedPoint.results.map((comp) => {
                            const isTarget = comp.placeId === activeGrid.targetPlaceId || 
                                             (activeGrid.targetDomain && comp.websiteUrl?.includes(activeGrid.targetDomain)) ||
                                             (activeGrid.targetName && comp.title.includes(activeGrid.targetName));
                                             
                            const isHighlight = comp.placeId === activeCompetitorPlaceId || comp.cid === activeCompetitorPlaceId;

                            return (
                              <div
                                key={comp.rank}
                                className={`p-2.5 rounded-lg border text-[11px] transition-all flex flex-col gap-1.5 ${isTarget ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm ring-1 ring-emerald-500/20' : isHighlight ? 'bg-amber-500/10 border-amber-500/40' : 'bg-card border-border/80'}`}
                              >
                                <div className="flex justify-between items-start gap-1">
                                  <span className="font-bold text-foreground leading-tight">{comp.rank}. {comp.title}</span>
                                  {isTarget && (
                                    <span className="bg-emerald-500 text-white font-bold text-[8px] px-1 py-0.5 rounded flex-shrink-0 uppercase">
                                      Target
                                    </span>
                                  )}
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                                  <span>★ {comp.rating} ({comp.reviewsCount} reviews)</span>
                                  {comp.googleMapsUrl && (
                                    <a
                                      href={comp.googleMapsUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline flex items-center gap-0.5"
                                      title="Open direct Google Maps URL"
                                    >
                                      Maps <ExternalLink className="h-2.5 w-2.5" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="h-full flex items-center justify-center text-center text-muted-foreground text-[10px] py-20">
                            Click on a map circle node to view local pack rankings at that spot.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Competitor Dominance Leaderboard table */}
                <Card className="border-border bg-slate-950/20">
                  <CardHeader className="py-4 border-b border-border/60">
                    <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4 text-primary" /> Competitor Dominance Leaderboard
                    </CardTitle>
                    <CardDescription className="text-[11px]">
                      Calculated Whitespark grid scores for all competitors found across the grid. Click a competitor to display their heatmap.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-muted/50 border-b border-border text-[10px] font-bold text-muted-foreground uppercase">
                          <tr>
                            <th className="p-3">Rank</th>
                            <th className="p-3">Business Name</th>
                            <th className="p-3">Visibility Score</th>
                            <th className="p-3">Avg Rank</th>
                            <th className="p-3">Review Score</th>
                            <th className="p-3">Rating</th>
                            <th className="p-3">Review Count</th>
                            <th className="p-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {leaderboard.map((item, idx) => {
                            const isSelectedComp = activeCompetitorPlaceId === item.placeId || activeCompetitorPlaceId === item.cid;
                            
                            return (
                              <tr 
                                key={idx}
                                className={`hover:bg-muted/30 transition-colors ${isSelectedComp ? 'bg-amber-500/5' : ''}`}
                              >
                                <td className="p-3 font-semibold text-muted-foreground">{idx + 1}</td>
                                <td className="p-3 font-bold text-foreground">{item.name}</td>
                                <td className="p-3 text-emerald-400 font-bold font-mono">{item.visibilityScore}%</td>
                                <td className="p-3 text-blue-400 font-bold font-mono">{item.averageRank}</td>
                                <td className="p-3 text-amber-400 font-bold font-mono">{item.relativeReviewScore}%</td>
                                <td className="p-3 text-slate-300">★ {item.rating}</td>
                                <td className="p-3 text-slate-400 font-mono">{item.reviewCount}</td>
                                <td className="p-3 text-center">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setActiveCompetitorPlaceId(isSelectedComp ? null : item.placeId || item.cid || null)}
                                    className="h-7 text-[10px] px-2 font-semibold cursor-pointer"
                                  >
                                    {isSelectedComp ? 'Reset' : 'View Heatmap'}
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* SVG charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Rank distribution chart */}
                  <Card className="border-border">
                    <CardHeader className="py-3">
                      <CardTitle className="text-xs font-bold">Rank Distribution Chart</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center py-2">
                      <div className="w-full max-w-[400px]">
                        <svg viewBox="0 0 400 200" className="w-full h-auto overflow-visible font-sans text-[10px] fill-muted-foreground">
                          <line x1="30" y1="20" x2="380" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                          <line x1="30" y1="70" x2="380" y2="70" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                          <line x1="30" y1="120" x2="380" y2="120" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                          <line x1="30" y1="170" x2="380" y2="170" stroke="rgba(255,255,255,0.1)" />

                          {(() => {
                            let c1 = 0, c2 = 0, c3 = 0, c4 = 0, c5 = 0;
                            activeGridPoints.forEach((pt) => {
                              const r = pt.rank || 21;
                              if (r <= 3) c1++;
                              else if (r <= 7) c2++;
                              else if (r <= 10) c3++;
                              else if (r <= 20) c4++;
                              else c5++;
                            });
                            const counts = [c1, c2, c3, c4, c5];

                            const maxVal = Math.max(...counts, 1);
                            const barWidth = 40;
                            const spacing = 32;
                            const startX = 50;

                            const colors = ['#10b981', '#f59e0b', '#f97316', '#ef4444', '#475569'];
                            const labels = ['Ranks 1-3', 'Ranks 4-7', 'Ranks 8-10', 'Ranks 11-20', 'Unranked'];

                            return counts.map((count, i) => {
                              const barHeight = (count / maxVal) * 130;
                              const x = startX + i * (barWidth + spacing);
                              const y = 170 - barHeight;

                              return (
                                <g key={i}>
                                  <rect
                                    x={x}
                                    y={y}
                                    width={barWidth}
                                    height={barHeight}
                                    fill={colors[i]}
                                    rx={4}
                                    className="transition-all duration-500 hover:opacity-85 cursor-pointer"
                                  />
                                  <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" className="font-bold fill-white">
                                    {count}
                                  </text>
                                  <text x={x + barWidth / 2} y={185} textAnchor="middle" className="fill-slate-400 font-medium text-[9px]">
                                    {labels[i]}
                                  </text>
                                </g>
                              );
                            });
                          })()}
                        </svg>
                      </div>
                    </CardContent>
                  </Card>

                  {/* historical averages chart */}
                  <Card className="border-border">
                    <CardHeader className="py-3">
                      <CardTitle className="text-xs font-bold">Historical Average Rank Progression</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center py-2">
                      {historyList.length > 1 ? (
                        <div className="w-full max-w-[400px]">
                          <svg viewBox="0 0 400 200" className="w-full h-auto overflow-visible font-sans text-[10px] fill-muted-foreground">
                            <line x1="30" y1="20" x2="380" y2="20" stroke="rgba(255,255,255,0.05)" />
                            <line x1="30" y1="95" x2="380" y2="95" stroke="rgba(255,255,255,0.05)" />
                            <line x1="30" y1="170" x2="380" y2="170" stroke="rgba(255,255,255,0.1)" />

                            {(() => {
                              const matchingScans = historyList
                                .filter(h => h.keyword === activeGrid.keyword)
                                .slice(0, 7)
                                .reverse();

                              if (matchingScans.length <= 1) {
                                return (
                                  <text x="200" y="100" textAnchor="middle" className="fill-slate-400">
                                    Needs more data points to plot trend.
                                  </text>
                                );
                              }

                              const size = matchingScans.length;
                              const spacing = 320 / (size - 1);
                              const pointsStr: string[] = [];

                              const elements = matchingScans.map((scan, i) => {
                                const x = 40 + i * spacing;
                                const y = 20 + ((scan.avgRank - 1) / 20) * 150;
                                pointsStr.push(`${x},${y}`);

                                return (
                                  <g key={i}>
                                    <circle cx={x} cy={y} r="4" fill="#3b82f6" stroke="#0f172a" strokeWidth="1.5" />
                                    <text x={x} y={y - 8} textAnchor="middle" className="font-bold fill-white">
                                      {scan.avgRank}
                                    </text>
                                    <text x={x} y={185} textAnchor="middle" className="fill-slate-500 font-medium text-[8px]">
                                      {new Date(scan.createdAt).toLocaleDateString()}
                                    </text>
                                  </g>
                                );
                              });

                              return (
                                <>
                                  <polyline
                                    fill="none"
                                    stroke="#3b82f6"
                                    strokeWidth="2.5"
                                    points={pointsStr.join(' ')}
                                  />
                                  {elements}
                                </>
                              );
                            })()}
                          </svg>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-center text-muted-foreground text-[10px] py-16">
                          Run multiple scans on this keyword to view historical average progression.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              // If no grid scan is active, render interactive preview map and coordinates layout
              <div className="space-y-6">


                <LeafletMap
                  center={{ lat: centerLat, lng: centerLng }}
                  points={previewPoints}
                  gridSize={gridSize}
                  onPointClick={() => {}}
                  selectedPointIndex={null}
                  isPreviewMode={true}
                />

                <Card className="border-border bg-slate-950/20">
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 text-amber-500" /> Scanner Not Run Yet
                    </CardTitle>
                    <CardDescription className="text-xs">
                      The map above is displaying real-time coordinate nodes preview around <strong>{customName || "Dr. Varun's Dental Clinic"}</strong>. Click <strong>"Run Bulk GeoGrid Scan"</strong> to query rankings and construct score heatmaps.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <Card className="border-border bg-slate-950/20">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <History className="h-4 w-4 text-primary" /> Historical Scanning Logs
            </CardTitle>
            <CardDescription className="text-xs">
              List of historical local ranking grid snapshots executed for this client listing.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {historyList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b border-border text-[10px] font-bold text-muted-foreground uppercase">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Keyword</th>
                      <th className="p-3">Matrix</th>
                      <th className="p-3">Radius</th>
                      <th className="p-3">Visibility Score</th>
                      <th className="p-3">Average Rank</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {historyList.map((grid) => (
                      <tr 
                        key={grid.id}
                        className="hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => handleLoadHistoryScan(grid)}
                      >
                        <td className="p-3 text-slate-400">
                          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-muted-foreground" /> {new Date(grid.createdAt).toLocaleDateString()}</span>
                        </td>
                        <td className="p-3 font-bold text-foreground">{grid.keyword}</td>
                        <td className="p-3 text-muted-foreground">{grid.gridSize}×{grid.gridSize}</td>
                        <td className="p-3 text-muted-foreground">{grid.radiusMiles} mi</td>
                        <td className="p-3 text-emerald-400 font-bold font-mono">{grid.visibilityScore}%</td>
                        <td className="p-3 text-blue-400 font-bold font-mono">{grid.avgRank}</td>
                        <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleLoadHistoryScan(grid)}
                              className="h-7 text-[10px] px-2 font-semibold cursor-pointer"
                            >
                              Load Map
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => handleDeleteScan(grid.id, e)}
                              className="h-7 w-7 text-muted-foreground hover:text-red-400 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground text-xs">
                No historical scans logs found. Submit a scan to begin.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
