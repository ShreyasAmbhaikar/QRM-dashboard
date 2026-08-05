'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GridPoint } from '../grid-calculator';
import { Loader2, Sun, Moon, Maximize2, Minimize2, Camera } from 'lucide-react';

interface LeafletMapProps {
  center: { lat: number; lng: number };
  points: GridPoint[];
  gridSize: number;
  onPointClick: (point: GridPoint, index: number) => void;
  selectedPointIndex: number | null;
  activeCompetitorPlaceId?: string | null;
  isPreviewMode?: boolean;
  onScreenshot?: () => void;
  keywords?: string[];
  activeKeywordIndex?: number;
  onKeywordChange?: (index: number) => void;
}

declare global {
  interface Window {
    L: any;
  }
}

export function LeafletMap({
  center,
  points,
  gridSize,
  onPointClick,
  selectedPointIndex,
  activeCompetitorPlaceId,
  isPreviewMode = false,
  onScreenshot,
  keywords,
  activeKeywordIndex,
  onKeywordChange,
}: LeafletMapProps) {
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  // Persist Map and Tile Layer in Refs to avoid asynchronous React-Leaflet lifecycle race conditions
  const mapRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  
  const [isMapboxLoaded, setIsMapboxLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mapTheme, setMapTheme] = useState<'dark' | 'light'>('dark');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 1. Dynamically load Leaflet CDN assets (CSS and JS)
  useEffect(() => {
    if (window.L) {
      setIsMapboxLoaded(true);
      return;
    }

    const leafletCssId = 'leaflet-css';
    if (!document.getElementById(leafletCssId)) {
      const link = document.createElement('link');
      link.id = leafletCssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.onload = () => {
      setIsMapboxLoaded(true);
    };
    script.onerror = () => {
      setLoadError('Failed to load Leaflet Map script from CDN.');
    };
    document.body.appendChild(script);
  }, []);

  // 2. Initialize Leaflet Map Instance ONCE on mount
  useEffect(() => {
    if (!isMapboxLoaded || !mapContainerRef.current) return;
    if (mapRef.current) return; // Prevent duplicate instantiation

    try {
      const L = window.L;
      const map = L.map(mapContainerRef.current, {
        center: [center.lat, center.lng],
        zoom: 14,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // Default Dark Mode tile
      const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CartoDB</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map);

      mapRef.current = map;
      tileLayerRef.current = tileLayer;
    } catch (err: any) {
      setLoadError(`Failed to initialize map: ${err.message}`);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        tileLayerRef.current = null;
      }
    };
  }, [isMapboxLoaded]);

  // 3. Update Center position dynamically
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setView([center.lat, center.lng]);
  }, [center]);

  // 4. Update Tile theme dynamically
  useEffect(() => {
    if (!tileLayerRef.current) return;
    const tileUrl = mapTheme === 'dark' 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    tileLayerRef.current.setUrl(tileUrl);
  }, [mapTheme]);

  // 5. Render and Update Grid Markers (Preview or Scanned Results)
  useEffect(() => {
    const map = mapRef.current;
    if (!isMapboxLoaded || !map || points.length === 0) return;

    const L = window.L;

    // Clear old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Draw grid points
    points.forEach((pt, index) => {
      let displayRank = pt.rank || 21;
      
      if (activeCompetitorPlaceId) {
        const foundComp = pt.results?.find(
          c => c.placeId === activeCompetitorPlaceId || c.cid === activeCompetitorPlaceId
        );
        displayRank = foundComp ? foundComp.rank : 21;
      }

      // Plain CSS inline styles (hex and rgba strings) to bypass html2canvas parsing errors for oklch()
      let customStyle = 'background-color: rgb(239, 68, 68); color: #ffffff; border: 1px solid rgb(252, 165, 165);';
      let labelText = displayRank === 21 ? '100+' : String(displayRank); // Matches Whitespark 100+ label style

      if (isPreviewMode) {
        // Slate-blue glowing preview circles
        customStyle = 'background-color: rgba(37, 99, 235, 0.9); color: #dbeafe; border: 1px solid rgb(96, 165, 250); box-shadow: 0 0 10px rgba(37, 99, 235, 0.4);';
        labelText = '?';
      } else {
        if (displayRank === 21) {
          customStyle = 'background-color: rgba(220, 38, 38, 0.9); color: #ffffff; border: 1px solid rgb(248, 113, 113);';
          labelText = '100+';
        } else if (displayRank <= 3) {
          customStyle = 'background-color: rgb(16, 185, 129); color: #ffffff; border: 1px solid rgb(110, 231, 183); font-weight: bold; box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);';
        } else if (displayRank <= 10) {
          customStyle = 'background-color: rgb(245, 158, 11); color: #ffffff; border: 1px solid rgb(252, 211, 77);';
        } else if (displayRank <= 20) {
          customStyle = 'background-color: rgb(249, 115, 22); color: #ffffff; border: 1px solid rgb(253, 186, 116);';
        } else {
          customStyle = 'background-color: rgb(239, 68, 68); color: #ffffff; border: 1px solid rgb(252, 165, 165);';
        }
      }

      const isSelected = selectedPointIndex === index;
      const borderClass = isSelected ? 'scale-125 border-2 border-white ring-4 ring-white/60 shadow-[0_0_15px_#fff]' : '';

      const markerIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="${customStyle}" class="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold shadow-2xl transition-all duration-300 hover:scale-125 cursor-pointer ${borderClass}">
            ${labelText}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([pt.lat, pt.lng], { icon: markerIcon }).addTo(map);

      // Tooltip binding
      marker.bindTooltip(`
        <div class="text-xs p-1 font-sans bg-slate-900 border border-slate-800 text-slate-100 rounded-md">
          <div class="font-bold border-b border-slate-700 pb-0.5 mb-1">${isPreviewMode ? 'Preview Coordinate' : 'Grid Coordinate'}</div>
          ${isPreviewMode ? '<div>Location Node</div>' : `<div>Rank: <span class="font-bold text-emerald-400">${displayRank === 21 ? '100+' : displayRank}</span></div>`}
          <div class="text-[10px] text-slate-400 mt-0.5">Lat: ${pt.lat.toFixed(4)}°, Lng: ${pt.lng.toFixed(4)}°</div>
        </div>
      `, {
        permanent: false,
        direction: 'top',
        opacity: 0.95,
        offset: [0, -10]
      });

      marker.on('click', () => {
        onPointClick(pt, index);
      });

      markersRef.current.push(marker);
    });

    // Auto-fit bounds
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.15));
    }

  }, [isMapboxLoaded, points, selectedPointIndex, activeCompetitorPlaceId, isPreviewMode]);

  // Fullscreen toggle event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    const element = mapWrapperRef.current;
    if (!element) return;
    
    if (!document.fullscreenElement) {
      element.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const toggleTheme = () => {
    setMapTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  if (loadError) {
    return (
      <div className="w-full aspect-video rounded-xl border border-border bg-destructive/10 p-6 flex flex-col items-center justify-center text-center">
        <span className="text-destructive font-semibold text-sm mb-2">Maps Display Error</span>
        <p className="text-xs text-muted-foreground max-w-sm">{loadError}</p>
      </div>
    );
  }

  return (
    <div 
      ref={mapWrapperRef} 
      className="relative w-full aspect-video rounded-xl border border-border overflow-hidden shadow-2xl animate-in fade-in duration-300"
      style={{ backgroundColor: '#020617' }} // Inline hex string to prevent html2canvas color parsing errors
    >
      {!isMapboxLoaded && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur z-30 flex flex-col items-center justify-center text-xs text-muted-foreground gap-2">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
          <span>Loading open-source mapping resources...</span>
        </div>
      )}
      
      {/* Map Target Element */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating Bulk Keyword Dropdown Overlay (Whitespark Style) */}
      {keywords && keywords.length > 0 && onKeywordChange && (
        <div className="absolute top-4 left-14 z-[2000]">
          <select
            value={activeKeywordIndex}
            onChange={(e) => onKeywordChange(Number(e.target.value))}
            className="h-9 px-3 pr-8 rounded-lg bg-slate-900/95 hover:bg-slate-800 text-slate-100 font-bold border border-slate-700/80 shadow-2xl text-[11px] focus-visible:outline-none cursor-pointer appearance-none relative transition-all"
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
              backgroundSize: '10px',
            }}
          >
            {keywords.map((kw, idx) => (
              <option key={idx} value={idx} className="bg-slate-950 text-slate-100 font-medium">
                {kw}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Floating Controls Overlay */}
      <div className="absolute top-4 right-4 z-[2000] flex flex-col gap-2">
        <button 
          onClick={toggleTheme}
          className="h-9 w-9 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-100 flex items-center justify-center border border-slate-700/80 shadow-2xl transition-all cursor-pointer"
          title="Toggle Map Style (Light/Dark)"
        >
          {mapTheme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-blue-400" />}
        </button>
        <button 
          onClick={toggleFullscreen}
          className="h-9 w-9 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-100 flex items-center justify-center border border-slate-700/80 shadow-2xl transition-all cursor-pointer"
          title="Toggle Fullscreen"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
        {onScreenshot && (
          <button 
            onClick={onScreenshot}
            className="h-9 w-9 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-100 flex items-center justify-center border border-slate-700/80 shadow-2xl transition-all cursor-pointer"
            title="Export Image Report"
          >
            <Camera className="h-4 w-4 text-emerald-400" />
          </button>
        )}
      </div>

      {/* Map Legend Details */}
      <div className="absolute bottom-3 left-3 z-20 flex flex-wrap gap-2.5 text-[10px] bg-slate-900/90 backdrop-blur p-2.5 rounded-lg border border-border shadow-xl text-slate-200">
        {isPreviewMode ? (
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_6px_#2563eb]" /> 
            Scanner Target Grid Preview Coordinates (Neutral)
          </span>
        ) : (
          <>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" /> Rank 1-3 (Map Pack)</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]" /> Rank 4-10</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Rank 11-20</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-600" /> Rank 20+</span>
          </>
        )}
      </div>
    </div>
  );
}
