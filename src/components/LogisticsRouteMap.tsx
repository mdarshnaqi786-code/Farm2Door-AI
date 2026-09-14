import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';
import { 
  Navigation, 
  Maximize2, 
  RotateCw, 
  Plus, 
  Minus, 
  Truck, 
  ShieldCheck, 
  Sparkles, 
  ArrowDown 
} from 'lucide-react';
import { OptimizedRouteResult, RouteStopDetail } from '../utils/routeOptimization';
import { LanguageCode, OrderStatus } from '../types';

// Fix Leaflet's default marker asset resolution so 404s never appear
try {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
} catch {
  // Ignore
}

interface LogisticsRouteMapProps {
  routePlan: OptimizedRouteResult | null;
  selectedStopNumber?: number | null;
  onSelectStop?: (stopNumber: number) => void;
  onUpdateStopStatus?: (orderId: string, newStatus: OrderStatus) => void;
  language?: LanguageCode;
}

type MapLayerStyle = 'osm' | 'hot';

export const LogisticsRouteMap: React.FC<LogisticsRouteMapProps> = ({
  routePlan,
  selectedStopNumber = null,
  onSelectStop,
  onUpdateStopStatus,
  language = 'en',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const activeLayerRef = useRef<MapLayerStyle>('osm');
  const markersRef = useRef<Map<number, L.Marker>>(new Map());

  const [currentLayerStyle, setCurrentLayerStyle] = useState<MapLayerStyle>('osm');
  const [activeStop, setActiveStop] = useState<RouteStopDetail | null>(null);
  const [isMapReady, setIsMapReady] = useState<boolean>(false);

  // Filter out non-empty stops
  const stops = useMemo(() => {
    return routePlan?.stops || [];
  }, [routePlan]);

  const originStop = useMemo(() => {
    return stops.find(s => s.type === 'origin') || null;
  }, [stops]);

  const customerStops = useMemo(() => {
    return stops.filter(s => s.type === 'customer');
  }, [stops]);

  const returnStop = useMemo(() => {
    return stops.find(s => s.type === 'return') || null;
  }, [stops]);

  // Keep internal activeStop in sync with selectedStopNumber prop
  useEffect(() => {
    if (selectedStopNumber !== null && selectedStopNumber !== undefined) {
      const match = stops.find(s => s.stopNumber === selectedStopNumber);
      if (match) {
        setActiveStop(match);
      }
    } else if (stops.length > 0) {
      // Default to stop 1 or origin
      const firstCustomer = stops.find(s => s.type === 'customer') || stops[0];
      setActiveStop(firstCustomer);
    }
  }, [selectedStopNumber, stops]);

  // --------------------------------------------------------------------------
  // 1. MAP INTERACTION HANDLERS & HELPERS (Declared early to prevent TDZ errors)
  // --------------------------------------------------------------------------
  const fitRouteBounds = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map || stops.length === 0) return;

    const bounds = L.latLngBounds([]);
    stops.forEach(s => bounds.extend([s.latitude, s.longitude]));

    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 14,
        animate: true,
      });
    }
  }, [stops]);

  const recenterToOrigin = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (originStop) {
      map.flyTo([originStop.latitude, originStop.longitude], 12, {
        duration: 1.2,
      });
      // Also open origin popup
      const originMarker = markersRef.current.get(0);
      if (originMarker) {
        setTimeout(() => originMarker.openPopup(), 600);
      }
    } else {
      fitRouteBounds();
    }
  }, [originStop, fitRouteBounds]);

  const handleZoomIn = useCallback(() => {
    mapInstanceRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    mapInstanceRef.current?.zoomOut();
  }, []);

  const handleSelectStopDetail = useCallback((stop: RouteStopDetail) => {
    setActiveStop(stop);
    if (onSelectStop) {
      onSelectStop(stop.stopNumber);
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    map.flyTo([stop.latitude, stop.longitude], 13.5, {
      duration: 0.9,
    });

    const marker = markersRef.current.get(stop.stopNumber);
    if (marker) {
      setTimeout(() => {
        marker.openPopup();
      }, 500);
    }
  }, [onSelectStop]);

  // Rich Leaflet popup HTML generator
  const createStopPopupContent = useCallback((stop: RouteStopDetail, isOrigin: boolean): string => {
    if (isOrigin) {
      return `
        <div class="p-4 space-y-2.5 text-stone-900">
          <div class="flex items-center justify-between border-b border-stone-100 pb-2">
            <span class="inline-flex items-center gap-1 text-[11px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              📍 Farmer Pickup
            </span>
            <span class="text-[10px] font-bold text-stone-500">Origin Hub</span>
          </div>

          <div>
            <h4 class="font-black text-sm text-stone-900">${stop.locationName}</h4>
            <p class="text-xs text-stone-600 mt-0.5 leading-relaxed">${stop.address}</p>
          </div>

          <div class="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-xs flex items-center justify-between">
            <span class="text-stone-500">Dispatch Departure:</span>
            <span class="font-black text-emerald-800">Check-in 0 km</span>
          </div>
        </div>
      `;
    }

    return `
      <div class="p-4 space-y-3 text-stone-900">
        <!-- Header with Stop Badge -->
        <div class="flex items-center justify-between border-b border-stone-100 pb-2">
          <div class="flex items-center gap-1.5">
            <span class="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-black">
              ${stop.stopNumber}
            </span>
            <span class="text-xs font-black text-stone-900">Stop ${stop.stopNumber} of ${customerStops.length}</span>
          </div>
          <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
            stop.status === 'Delivered' 
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
              : stop.status === 'In Transit'
              ? 'bg-blue-100 text-blue-800 border border-blue-300'
              : 'bg-amber-100 text-amber-900 border border-amber-300'
          }">
            ${stop.status || 'Pending'}
          </span>
        </div>

        <!-- Customer & Order details -->
        <div>
          <div class="text-[10px] uppercase font-extrabold text-stone-400">Customer</div>
          <h4 class="font-black text-sm text-stone-900">${stop.customerName || 'Customer'}</h4>
          <p class="text-xs text-stone-600 mt-0.5 leading-snug">${stop.address}</p>
          ${stop.orderId ? `<div class="text-[11px] font-mono text-stone-500 mt-1 font-bold">Order: #${stop.orderId}</div>` : ''}
        </div>

        <!-- Commodity & Quantity -->
        ${stop.product ? `
          <div class="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100 text-xs space-y-1">
            <div class="flex justify-between">
              <span class="text-stone-600">Product:</span>
              <strong class="font-black text-emerald-950">${stop.product}</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-stone-600">Quantity:</span>
              <strong class="font-black text-emerald-950">${stop.quantity || 'Standard'}</strong>
            </div>
          </div>
        ` : ''}

        <!-- Distance & Time Metrics -->
        <div class="grid grid-cols-2 gap-2 text-xs bg-stone-50 p-2.5 rounded-xl border border-stone-200">
          <div>
            <span class="text-stone-500 text-[10px] block">Distance:</span>
            <strong class="font-black text-stone-900 text-xs">${stop.legDistanceKm} km</strong>
          </div>
          <div>
            <span class="text-stone-500 text-[10px] block">Cumulative:</span>
            <strong class="font-black text-blue-800 text-xs">${stop.cumulativeDistanceKm} km</strong>
          </div>
        </div>

        <div class="text-[11px] text-stone-500 flex items-center justify-between pt-0.5">
          <span>Est. Delivery Travel:</span>
          <span class="font-black text-stone-800">~${stop.cumulativeMinutes} mins</span>
        </div>
      </div>
    `;
  }, [customerStops.length]);

  // --------------------------------------------------------------------------
  // 2. INITIALIZE LEAFLET MAP INSTANCE
  // --------------------------------------------------------------------------
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    // Clean up existing map or prior _leaflet_id if container changes/remounts
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch {
        // ignore
      }
      mapInstanceRef.current = null;
    }

    if ((container as any)._leaflet_id) {
      delete (container as any)._leaflet_id;
    }

    // Default center: Vijayawada / Gollapudi hub region
    const defaultCenter: [number, number] = [16.5414, 80.5936];

    let map: L.Map;
    try {
      map = L.map(container, {
        center: defaultCenter,
        zoom: 11,
        zoomControl: false, // We render modern custom controls
        attributionControl: false,
      });
    } catch {
      delete (container as any)._leaflet_id;
      map = L.map(container, {
        center: defaultCenter,
        zoom: 11,
        zoomControl: false,
        attributionControl: false,
      });
    }

    // Add OpenStreetMap tile layer (no API key required, reliable, public open-source)
    const tileLayer = L.tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
      }
    ).addTo(map);

    // Add compact attribution in bottom-right
    L.control.attribution({ position: 'bottomright', prefix: false })
      .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors')
      .addTo(map);

    tileLayerRef.current = tileLayer;

    // Layer group for all dynamic route elements (markers, polylines, badges)
    const routeLayerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = routeLayerGroup;

    mapInstanceRef.current = map;
    activeLayerRef.current = 'osm';
    setIsMapReady(true);

    // Ensure Leaflet calculates viewport bounds properly on mount
    const timer = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch {
        // ignore
      }
    }, 150);

    // Invalidate size on window or container resize
    const resizeObserver = new ResizeObserver(() => {
      try {
        map.invalidateSize();
      } catch {
        // ignore
      }
    });
    resizeObserver.observe(container);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {
          // ignore
        }
        mapInstanceRef.current = null;
      }
      if (container) {
        delete (container as any)._leaflet_id;
      }
      setIsMapReady(false);
    };
  }, []);

  // --------------------------------------------------------------------------
  // 3. SWITCH MAP TILE STYLES (OSM / HIGH CLARITY HOT) - NO API KEYS REQUIRED
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    // Prevent redundant tile switching if already active
    if (activeLayerRef.current === currentLayerStyle) return;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    let url = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    let subdomains: string[] | string = 'abc';

    if (currentLayerStyle === 'hot') {
      url = 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
      subdomains = 'ab';
    }

    const newTileLayer = L.tileLayer(url, {
      subdomains,
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newTileLayer;
    activeLayerRef.current = currentLayerStyle;
  }, [currentLayerStyle]);

  // --------------------------------------------------------------------------
  // 4. RENDER REALISTIC ROUTE, MARKERS, AND POLYLINES
  // --------------------------------------------------------------------------
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup || !isMapReady) return;

    // Clear previous elements
    layerGroup.clearLayers();
    markersRef.current.clear();

    if (stops.length === 0) return;

    // Bounds collector
    const bounds = L.latLngBounds([]);

    // ------------------------------------------------------------------------
    // A. POLYLINE RENDERING (Nearest Neighbour Calculated Sequence)
    // ------------------------------------------------------------------------
    const forwardStops = stops.filter(s => s.type !== 'return');
    const forwardPoints: [number, number][] = forwardStops.map(s => [s.latitude, s.longitude]);

    forwardPoints.forEach(pt => bounds.extend(pt));

    if (forwardPoints.length > 1) {
      // 1. Casing / Drop Shadow Line (gives road-like depth)
      L.polyline(forwardPoints, {
        color: '#064e3b',
        weight: 8,
        opacity: 0.25,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(layerGroup);

      // 2. Main High-Visibility Route Line
      const routePolyline = L.polyline(forwardPoints, {
        color: '#059669', // Emerald green brand color
        weight: 5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(layerGroup);

      // Add click to focus route
      routePolyline.on('click', () => {
        fitRouteBounds();
      });

      // 3. Intermediate Leg Distance Badges on road segments
      for (let i = 1; i < forwardStops.length; i++) {
        const prev = forwardStops[i - 1];
        const curr = forwardStops[i];
        const midLat = (prev.latitude + curr.latitude) / 2;
        const midLng = (prev.longitude + curr.longitude) / 2;

        const legBadgeHtml = `
          <div class="px-2 py-0.5 rounded-full bg-stone-900/90 text-amber-300 border border-stone-700 shadow-md text-[10px] font-extrabold whitespace-nowrap pointer-events-none flex items-center gap-1">
            <span>${curr.legDistanceKm} km</span>
          </div>
        `;

        const badgeIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: legBadgeHtml,
          iconSize: [60, 20],
          iconAnchor: [30, 10],
        });

        L.marker([midLat, midLng], { icon: badgeIcon, interactive: false }).addTo(layerGroup);
      }
    }

    // ------------------------------------------------------------------------
    // B. RETURN LEG POLYLINE (If Round-Trip Mode is Enabled)
    // ------------------------------------------------------------------------
    if (returnStop && forwardPoints.length > 1) {
      const lastStop = forwardStops[forwardStops.length - 1];
      const returnPoints: [number, number][] = [
        [lastStop.latitude, lastStop.longitude],
        [returnStop.latitude, returnStop.longitude],
      ];

      L.polyline(returnPoints, {
        color: '#0d9488', // Teal
        weight: 3.5,
        dashArray: '8, 8',
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(layerGroup);

      // Midpoint return distance badge
      const midLat = (lastStop.latitude + returnStop.latitude) / 2;
      const midLng = (lastStop.longitude + returnStop.longitude) / 2;

      const returnBadgeHtml = `
        <div class="px-2 py-0.5 rounded-full bg-teal-950/90 text-teal-200 border border-teal-700 shadow-md text-[10px] font-extrabold whitespace-nowrap pointer-events-none flex items-center gap-1">
          <span>↺ Return ${returnStop.legDistanceKm} km</span>
        </div>
      `;

      const returnBadgeIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: returnBadgeHtml,
        iconSize: [85, 20],
        iconAnchor: [42, 10],
      });

      L.marker([midLat, midLng], { icon: returnBadgeIcon, interactive: false }).addTo(layerGroup);
    }

    // ------------------------------------------------------------------------
    // C. PROFESSIONAL LOCATION MARKERS (Farmer Hub & Numbered Customers)
    // ------------------------------------------------------------------------
    stops.forEach((stop) => {
      // Avoid duplicate marker if return stop is identical to origin hub
      if (stop.type === 'return') return;

      const isOrigin = stop.type === 'origin';
      const isSelected = activeStop?.stopNumber === stop.stopNumber;

      let markerHtml = '';

      if (isOrigin) {
        // DISTINCTIVE FARMER PICKUP MARKER:
        // 📍 FARM badge, label "Pickup — Farm", pulsating radar anchor
        markerHtml = `
          <div class="relative flex flex-col items-center group cursor-pointer" style="transform: translate(-50%, -100%);">
            <div class="flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-2xl shadow-xl border-2 border-white transition-all transform hover:scale-105">
              <span class="text-sm">🚜</span>
              <div class="flex flex-col text-left">
                <span class="text-[9px] font-extrabold text-amber-300 uppercase tracking-wider leading-none">Start</span>
                <span class="text-xs font-black tracking-tight leading-tight">Pickup — Farm</span>
              </div>
            </div>
            <div class="w-3.5 h-3.5 bg-emerald-800 border-2 border-white rounded-full mt-[-3px] shadow-md"></div>
            <div class="absolute -bottom-1 w-6 h-6 rounded-full bg-emerald-500/40 animate-pulse-ring -z-10"></div>
          </div>
        `;
      } else {
        // NUMBERED CUSTOMER MARKER:
        // Number representing actual optimized delivery sequence (1, 2, 3...)
        const ringClass = isSelected 
          ? 'border-blue-600 ring-4 ring-blue-400/50 scale-110' 
          : 'border-emerald-600 hover:border-emerald-700 hover:scale-105';

        const numBgClass = isSelected ? 'bg-blue-600 text-white' : 'bg-emerald-700 text-white';

        markerHtml = `
          <div class="relative flex flex-col items-center group cursor-pointer" style="transform: translate(-50%, -100%);">
            <div class="flex items-center gap-1.5 bg-white text-stone-900 pl-1 pr-2.5 py-1 rounded-full shadow-xl border-2 ${ringClass} transition-all">
              <div class="w-5 h-5 rounded-full ${numBgClass} flex items-center justify-center text-[11px] font-black shadow-xs shrink-0">
                ${stop.stopNumber}
              </div>
              <div class="flex flex-col text-left leading-tight pr-1">
                <span class="text-[11px] font-extrabold text-stone-900 truncate max-w-[110px]">
                  ${stop.customerName || 'Customer'}
                </span>
                <span class="text-[9px] font-semibold text-stone-500">
                  ${stop.legDistanceKm} km
                </span>
              </div>
            </div>
            <div class="w-2.5 h-2.5 ${isSelected ? 'bg-blue-600' : 'bg-emerald-700'} border-2 border-white rounded-full mt-[-2px] shadow-sm"></div>
          </div>
        `;
      }

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: markerHtml,
        iconSize: [120, 50],
        iconAnchor: [60, 50],
        popupAnchor: [0, -45],
      });

      const marker = L.marker([stop.latitude, stop.longitude], { icon: customIcon })
        .addTo(layerGroup);

      markersRef.current.set(stop.stopNumber, marker);

      // Create rich popup card matching specification
      const popupContent = createStopPopupContent(stop, isOrigin);
      marker.bindPopup(popupContent, {
        maxWidth: 320,
        className: 'custom-route-popup',
        autoPan: true,
        autoPanPadding: L.point(40, 40),
      });

      marker.on('click', () => {
        setActiveStop(stop);
        if (onSelectStop) {
          onSelectStop(stop.stopNumber);
        }
      });
    });

    // ------------------------------------------------------------------------
    // D. AUTOMATIC INITIAL FIT TO COMPLETE ROUTE
    // ------------------------------------------------------------------------
    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 14,
        animate: true,
      });
    }

  }, [stops, returnStop, activeStop, isMapReady, onSelectStop, fitRouteBounds, createStopPopupContent]);

  return (
    <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-7 shadow-xs space-y-6">
      
      {/* 1. TOP HEADER & MAP CONTROLS BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black">
              <Navigation className="w-3.5 h-3.5 text-emerald-700" />
              <span>Real-World Delivery Map</span>
            </span>
            <span className="text-xs font-bold text-stone-500">
              &bull; Nearest Neighbour Heuristic Sequence
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-display">
            {language === 'hi' 
              ? 'किसान स्मार्ट रूट और सड़क नेविगेशन' 
              : language === 'te' 
              ? 'రైతు స్మార్ట్ రూట్ & రోడ్ నావిగేషన్' 
              : 'Farmer Logistics Navigation & Road Network'}
          </h2>

          <p className="text-xs text-stone-500">
            Live geographic coordinates rendered over road infrastructure &bull; Sequenced from Farmer Pickup through customer delivery checkpoints.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          
          {/* Map Layer Style Switcher (No API Key Needed) */}
          <div className="flex items-center bg-stone-100 p-1 rounded-2xl border border-stone-200 text-xs font-bold">
            <button
              onClick={() => setCurrentLayerStyle('osm')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                currentLayerStyle === 'osm'
                  ? 'bg-white text-emerald-900 font-black shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Standard OpenStreetMap Road Network"
            >
              OSM Roads
            </button>
            <button
              onClick={() => setCurrentLayerStyle('hot')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                currentLayerStyle === 'hot'
                  ? 'bg-white text-emerald-900 font-black shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Humanitarian OpenStreetMap: High clarity roads and districts"
            >
              High Clarity
            </button>
          </div>

          {/* Fit Route Button */}
          <button
            id="map-fit-route-btn"
            onClick={fitRouteBounds}
            className="p-2.5 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            title="Fit complete delivery route into view"
          >
            <Maximize2 className="w-4 h-4 text-emerald-700" />
            <span className="hidden sm:inline">Fit Route</span>
          </button>

          {/* Recenter Route Button */}
          <button
            id="map-recenter-btn"
            onClick={recenterToOrigin}
            className="p-2.5 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            title="Recenter to Farmer Pickup Hub"
          >
            <RotateCw className="w-4 h-4 text-blue-700" />
            <span className="hidden sm:inline">Recenter</span>
          </button>

          {/* Zoom Buttons */}
          <div className="flex items-center bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
            <button
              id="map-zoom-in-btn"
              onClick={handleZoomIn}
              className="p-2.5 hover:bg-stone-100 text-stone-700 transition-colors cursor-pointer border-r border-stone-200"
              title="Zoom In"
              aria-label="Zoom in"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              id="map-zoom-out-btn"
              onClick={handleZoomOut}
              className="p-2.5 hover:bg-stone-100 text-stone-700 transition-colors cursor-pointer"
              title="Zoom Out"
              aria-label="Zoom out"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN MAP VIEWPORT & SIDEBAR SPLIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT / MAIN COLUMN: REALISTIC INTERACTIVE LEAFLET MAP */}
        <div className="lg:col-span-8 space-y-3">
          
          <div className="relative w-full rounded-3xl overflow-hidden border border-stone-200 shadow-md bg-stone-100">
            
            {/* The Leaflet Map Container */}
            <div 
              ref={mapContainerRef} 
              id="logistics-leaflet-map-canvas"
              className="w-full h-[450px] sm:h-[540px] z-0"
              style={{ background: '#f8fafc' }}
            />

            {/* Floating Top Route Summary Pill */}
            {routePlan && stops.length > 0 && (
              <div className="absolute top-4 left-4 z-[1000] bg-stone-900/90 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl shadow-xl border border-stone-700 flex items-center gap-3 text-xs pointer-events-none">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-extrabold text-white">{routePlan.totalDistanceKm} km</span>
                </div>
                <span className="text-stone-500">&bull;</span>
                <span className="text-stone-300 font-bold">{routePlan.customerCount} Stops</span>
                <span className="text-stone-500">&bull;</span>
                <span className="text-amber-300 font-extrabold">₹{routePlan.estimatedTotalCost}</span>
              </div>
            )}

            {/* Empty State Overlay if no route stops */}
            {(!routePlan || stops.length === 0) && (
              <div className="absolute inset-0 z-[1000] bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-6 max-w-sm text-center shadow-2xl border border-stone-200 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-100">
                    <Truck className="w-6 h-6 text-emerald-700" />
                  </div>
                  <h4 className="font-bold text-stone-900 text-sm">No Pending Deliveries</h4>
                  <p className="text-xs text-stone-500">Live routes will appear as customer orders are placed or dispatched.</p>
                </div>
              </div>
            )}

            {/* Floating Map Legend (Bottom-Left) */}
            <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md text-stone-800 px-3 py-2 rounded-2xl shadow-lg border border-stone-200/90 text-[11px] font-bold flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-800 border-2 border-white flex items-center justify-center text-[8px] text-white">📍</span>
                <span>Farmer Hub</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[9px] font-bold">1</span>
                <span>Delivery Stop</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3.5 h-1 bg-emerald-600 rounded-full"></span>
                <span>Outward Route</span>
              </div>
              {routePlan?.isRoundTrip && (
                <div className="flex items-center gap-1">
                  <span className="w-3.5 h-0.5 border-t border-dashed border-teal-600"></span>
                  <span>Return Leg</span>
                </div>
              )}
            </div>

          </div>

          <div className="text-[11px] text-stone-500 flex items-center justify-between px-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Click any marker or route stop to inspect customer order details and fly to location.</span>
            </span>
            <span className="font-semibold text-stone-400">
              Corridor: Vijayawada &bull; Mangalagiri &bull; Guntur &bull; Tenali
            </span>
          </div>

        </div>

        {/* RIGHT COLUMN: ROUTE SIDEBAR / DETAILS PANEL */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-stone-50 rounded-3xl p-5 border border-stone-200 space-y-4">
            
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-base font-black text-stone-900 font-display">
                  Optimized Delivery Route
                </h3>
                <p className="text-xs text-stone-500">
                  {routePlan?.customerCount || 0} customers &bull; {routePlan?.totalDistanceKm || 0} km total
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                Sequential
              </span>
            </div>

            {/* Sequential Route Stop Cards */}
            {stops.length === 0 ? (
              <div className="p-6 text-center text-stone-500 text-xs bg-white rounded-2xl border border-stone-200 space-y-1">
                <p className="font-bold text-stone-700">No active delivery stops</p>
                <p className="text-[11px] text-stone-400">Add or dispatch orders to generate delivery stops.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {stops.map((stop, idx) => {
                const isOrigin = stop.type === 'origin';
                const isReturn = stop.type === 'return';
                const isSelected = activeStop?.stopNumber === stop.stopNumber;

                return (
                  <div key={`sidebar-stop-${stop.stopNumber}-${idx}`} className="space-y-1.5">
                    
                    {/* Directional Connector Arrow between stops */}
                    {idx > 0 && (
                      <div className="flex items-center gap-2 pl-4 py-0.5 text-stone-400">
                        <ArrowDown className="w-3.5 h-3.5 text-emerald-700" />
                        <span className="text-[10px] font-bold text-stone-500">
                          {stop.legDistanceKm} km leg &bull; ~{stop.legMinutes} min
                        </span>
                      </div>
                    )}

                    {/* Stop Card */}
                    <div
                      onClick={() => handleSelectStopDetail(stop)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-300'
                          : isOrigin
                          ? 'bg-emerald-900 text-white border-emerald-950 hover:bg-emerald-800'
                          : isReturn
                          ? 'bg-teal-900 text-white border-teal-950 hover:bg-teal-800'
                          : 'bg-white hover:bg-stone-100 text-stone-900 border-stone-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        
                        <div className="flex items-start gap-2.5">
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                            isOrigin 
                              ? 'bg-white text-emerald-900' 
                              : isReturn 
                              ? 'bg-white text-teal-900' 
                              : isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}>
                            {isOrigin ? '🚜' : isReturn ? '🏁' : stop.stopNumber}
                          </div>

                          <div className="space-y-0.5 text-left">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[10px] font-black uppercase tracking-wider ${
                                isOrigin || isReturn ? 'text-emerald-200' : 'text-emerald-800'
                              }`}>
                                {isOrigin ? 'START' : isReturn ? 'END' : `Stop ${stop.stopNumber}`}
                              </span>
                              {stop.status && !isOrigin && !isReturn && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-stone-100 text-stone-600">
                                  {stop.status}
                                </span>
                              )}
                            </div>

                            <h4 className={`text-xs font-black truncate max-w-[160px] ${
                              isOrigin || isReturn ? 'text-white' : 'text-stone-900'
                            }`}>
                              {isOrigin ? 'Farmer Pickup' : isReturn ? 'Return to Farm' : (stop.customerName || 'Customer')}
                            </h4>

                            <p className={`text-[11px] truncate max-w-[170px] ${
                              isOrigin || isReturn ? 'text-stone-300' : 'text-stone-500'
                            }`}>
                              {stop.locationName}
                            </p>
                          </div>
                        </div>

                        {/* Distance info on right */}
                        <div className="text-right shrink-0">
                          <div className={`text-xs font-black ${
                            isOrigin || isReturn ? 'text-white' : 'text-emerald-800'
                          }`}>
                            {stop.legDistanceKm} km
                          </div>
                          <div className={`text-[10px] ${
                            isOrigin || isReturn ? 'text-stone-300' : 'text-stone-400'
                          }`}>
                            +{stop.cumulativeDistanceKm} km
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            )}

            {/* Quick Inspect Details Box for Selected Stop */}
            {activeStop && activeStop.type === 'customer' && (
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <span className="font-extrabold text-stone-900">
                    Selected: {activeStop.customerName}
                  </span>
                  <span className="text-[10px] font-mono text-stone-500">
                    #{activeStop.orderId}
                  </span>
                </div>
                <div className="text-stone-600 space-y-1">
                  <div><strong>Address:</strong> {activeStop.address}</div>
                  {activeStop.product && (
                    <div><strong>Items:</strong> {activeStop.quantity} of {activeStop.product}</div>
                  )}
                  <div className="flex justify-between pt-1 text-stone-800">
                    <span>Est. Travel Time:</span>
                    <strong className="text-emerald-800">~{activeStop.cumulativeMinutes} mins</strong>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
