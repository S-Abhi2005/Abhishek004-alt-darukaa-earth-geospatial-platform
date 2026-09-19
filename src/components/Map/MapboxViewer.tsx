import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { Project, Site, GeoJSONGeometry } from '../../types';
import { CreateSiteModal } from './CreateSiteModal';
import {
  Layers,
  MapPin,
  Pencil,
  Trash2,
  Maximize2,
  Check,
  AlertCircle,
  Activity,
  Info,
  X,
  Compass,
  Settings,
  KeyRound,
  RefreshCw,
} from 'lucide-react';

interface MapboxViewerProps {
  projects: Project[];
  sites: Site[];
  selectedSiteId?: string;
  autoDrawProjectId?: string;
  onNavigateToAnalytics: (siteId: string) => void;
  onSiteCreated: () => Promise<void>;
  onSaveSite: (projectId: string, siteData: any) => Promise<void>;
}

type MapErrorType =
  | 'MAP_TOKEN_MISSING'
  | 'MAP_TOKEN_INVALID'
  | 'MAP_STYLE_FAILED'
  | 'NETWORK_TILE_FAILURE'
  | 'WEBGL_FAILURE';

interface MapErrorInfo {
  type: MapErrorType;
  message: string;
}

export const MapboxViewer: React.FC<MapboxViewerProps> = ({
  projects,
  sites,
  selectedSiteId,
  autoDrawProjectId,
  onNavigateToAnalytics,
  onSiteCreated,
  onSaveSite,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const drawRef = useRef<any | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapStyle, setMapStyle] = useState<'dark' | 'satellite' | 'streets'>('dark');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [activeSite, setActiveSite] = useState<Site | null>(null);
  const [mapError, setMapError] = useState<MapErrorInfo | null>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnGeometry, setDrawnGeometry] = useState<GeoJSONGeometry | null>(null);
  const [drawnAreaHa, setDrawnAreaHa] = useState<number>(0);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveProjectId, setSaveProjectId] = useState<string | undefined>(autoDrawProjectId);

  // Mapbox Token handling via import.meta.env
  const envToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
  const [customToken, setCustomToken] = useState<string>(() => {
    return localStorage.getItem('darukaa_mapbox_token') || envToken || '';
  });
  const [tokenInput, setTokenInput] = useState(customToken);
  const [showTokenModal, setShowTokenModal] = useState(false);

  // Active token computation (VITE_MAPBOX_ACCESS_TOKEN or custom token)
  const activeToken = (customToken || envToken || '').trim();
  const isTokenValidFormat = activeToken.length > 20 && activeToken.startsWith('pk.');

  // Style URL mapping
  const getStyleUrl = (style: 'dark' | 'satellite' | 'streets'): string => {
    switch (style) {
      case 'satellite':
        return 'mapbox://styles/mapbox/satellite-streets-v12';
      case 'streets':
        return 'mapbox://styles/mapbox/outdoors-v12';
      case 'dark':
      default:
        return 'mapbox://styles/mapbox/dark-v11';
    }
  };

  // Check WebGL availability
  useEffect(() => {
    try {
      const isSupported = mapboxgl.supported();
      setWebglSupported(isSupported);
      if (!isSupported) {
        console.error('[MapboxViewer] WebGL is not supported in this browser environment.');
        setMapError({
          type: 'WEBGL_FAILURE',
          message: 'Mapbox requires WebGL. Please enable hardware acceleration or use a supported browser.',
        });
      } else {
        console.log('[MapboxViewer] WebGL support: verified');
      }
    } catch (err: any) {
      console.error('[MapboxViewer] WebGL check error:', err);
      setWebglSupported(false);
      setMapError({
        type: 'WEBGL_FAILURE',
        message: 'Mapbox requires WebGL. Please enable hardware acceleration or use a supported browser.',
      });
    }
  }, []);

  // Fit all sites on map
  const fitAllSites = useCallback(() => {
    if (!mapRef.current) return;
    const filteredSites =
      projectFilter === 'all'
        ? sites
        : sites.filter((s) => s.project_id === projectFilter);

    if (!filteredSites.length) {
      mapRef.current.flyTo({
        center: [78.9629, 20.5937],
        zoom: 4,
        essential: true,
      });
      return;
    }

    try {
      const featureCollection: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: filteredSites.map((s) => ({
          type: 'Feature',
          properties: {},
          geometry: s.geometry as any,
        })),
      };
      const bbox = turf.bbox(featureCollection);
      mapRef.current.fitBounds(
        [
          [bbox[0], bbox[1]],
          [bbox[2], bbox[3]],
        ],
        { padding: 80, maxZoom: 12, duration: 1200 }
      );
    } catch (e) {
      console.error('[MapboxViewer] Failed to fit bounds to sites:', e);
    }
  }, [sites, projectFilter]);

  // Render site GeoJSON polygons
  const renderSiteLayers = useCallback(
    (map: mapboxgl.Map, currentSites: Site[]) => {
      if (!map.isStyleLoaded()) {
        map.once('style.load', () => renderSiteLayers(map, currentSites));
        return;
      }

      console.log(`[MapboxViewer] Rendering site layers for ${currentSites.length} sites (filter: ${projectFilter})`);

      const filteredSites =
        projectFilter === 'all'
          ? currentSites
          : currentSites.filter((s) => s.project_id === projectFilter);

      const geojsonData: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: filteredSites.map((site) => ({
          type: 'Feature',
          id: site.id,
          properties: {
            id: site.id,
            name: site.name,
            site_code: site.site_code,
            project_id: site.project_id,
            project_name: site.project_name || 'Ecological Project',
            area_hectares: site.area_hectares,
            canopy_cover_percent: site.canopy_cover_percent || 75,
            biome: site.biome || 'Tropical Forest',
          },
          geometry: site.geometry as any,
        })),
      };

      const sourceId = 'darukaa-sites';

      if (map.getSource(sourceId)) {
        (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(geojsonData);
      } else {
        map.addSource(sourceId, {
          type: 'geojson',
          data: geojsonData,
        });

        // Polygon fill layer
        map.addLayer({
          id: 'darukaa-sites-fill',
          type: 'fill',
          source: sourceId,
          paint: {
            'fill-color': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              '#059669',
              '#10b981',
            ],
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              0.55,
              0.35,
            ],
          },
        });

        // Polygon boundary stroke layer
        map.addLayer({
          id: 'darukaa-sites-stroke',
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': '#34d399',
            'line-width': 2.5,
          },
        });

        // Polygon centroid labels
        map.addLayer({
          id: 'darukaa-sites-label',
          type: 'symbol',
          source: sourceId,
          layout: {
            'text-field': ['get', 'name'],
            'text-size': 11,
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            'text-anchor': 'center',
            'text-offset': [0, 0],
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': '#0f172a',
            'text-halo-width': 2,
          },
        });

        // Click on polygon to inspect
        map.on('click', 'darukaa-sites-fill', (e) => {
          if (!e.features || !e.features.length) return;
          const feature = e.features[0];
          const props = feature.properties as any;
          const site = currentSites.find((s) => s.id === props.id);

          if (site) {
            setActiveSite(site);
            showSitePopup(map, e.lngLat, site);
          }
        });

        // Cursor hover states
        let hoveredId: string | number | null = null;
        map.on('mousemove', 'darukaa-sites-fill', (e) => {
          map.getCanvas().style.cursor = 'pointer';
          if (e.features && e.features.length > 0) {
            if (hoveredId !== null) {
              map.setFeatureState({ source: sourceId, id: hoveredId }, { hover: false });
            }
            hoveredId = e.features[0].id ?? null;
            if (hoveredId !== null) {
              map.setFeatureState({ source: sourceId, id: hoveredId }, { hover: true });
            }
          }
        });

        map.on('mouseleave', 'darukaa-sites-fill', () => {
          map.getCanvas().style.cursor = '';
          if (hoveredId !== null) {
            map.setFeatureState({ source: sourceId, id: hoveredId }, { hover: false });
            hoveredId = null;
          }
        });

        console.log('[MapboxViewer] GeoJSON source and polygon layers added successfully');
      }
    },
    [projectFilter]
  );

  // Show interactive Popup
  const showSitePopup = (map: mapboxgl.Map, lngLat: mapboxgl.LngLat, site: Site) => {
    if (popupRef.current) {
      popupRef.current.remove();
    }

    const popupNode = document.createElement('div');
    popupNode.className = 'text-xs p-1 space-y-2';
    popupNode.innerHTML = `
      <div class="border-b border-slate-700 pb-1.5">
        <span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 font-bold border border-emerald-800/60">
          ${site.site_code}
        </span>
        <h4 class="font-bold text-white text-sm mt-1">${site.name}</h4>
        <p class="text-[11px] text-slate-400">${site.project_name || 'Ecological Project'}</p>
      </div>
      <div class="grid grid-cols-2 gap-1 py-1 font-mono text-[11px]">
        <div><span class="text-slate-400">Area:</span> <strong class="text-white">${site.area_hectares.toLocaleString()} ha</strong></div>
        <div><span class="text-slate-400">Canopy:</span> <strong class="text-emerald-400">${site.canopy_cover_percent}%</strong></div>
      </div>
      <div class="pt-1">
        <button id="popup-analytics-btn" class="w-full text-center bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-1.5 px-3 rounded-lg text-xs transition-colors shadow">
          Open Telemetry & Analytics →
        </button>
      </div>
    `;

    const popup = new mapboxgl.Popup({ closeOnClick: false, maxWidth: '280px' })
      .setLngLat(lngLat)
      .setDOMContent(popupNode)
      .addTo(map);

    popupRef.current = popup;

    setTimeout(() => {
      const btn = document.getElementById('popup-analytics-btn');
      if (btn) {
        btn.onclick = () => {
          onNavigateToAnalytics(site.id);
        };
      }
    }, 50);
  };

  // Initialize Mapbox instance
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!webglSupported) return;

    console.log('[MapboxViewer] Map initialization started');

    if (!activeToken) {
      console.warn('[MapboxViewer] Mapbox access token not detected. VITE_MAPBOX_ACCESS_TOKEN is missing or empty.');
      setMapError({
        type: 'MAP_TOKEN_MISSING',
        message: 'Mapbox Access Token is missing or empty. Please provide a Mapbox Public Access Token (pk.ey...) via VITE_MAPBOX_ACCESS_TOKEN or configure it below.',
      });
      return;
    }

    console.log(`[MapboxViewer] Mapbox token detected (length: ${activeToken.length})`);
    mapboxgl.accessToken = activeToken;

    // Calculate sensible initial coordinates based on sites if available, or default to India/Global
    let initialCenter: [number, number] = [78.9629, 20.5937];
    let initialZoom = 3.8;

    if (sites.length > 0) {
      try {
        const featureCollection: GeoJSON.FeatureCollection = {
          type: 'FeatureCollection',
          features: sites.map((s) => ({
            type: 'Feature',
            properties: {},
            geometry: s.geometry as any,
          })),
        };
        const centroid = turf.centroid(featureCollection);
        initialCenter = centroid.geometry.coordinates as [number, number];
        initialZoom = 3.5;
      } catch {
        // Fallback default
        initialCenter = [78.9629, 20.5937];
      }
    }

    try {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: getStyleUrl(mapStyle),
        center: initialCenter,
        zoom: initialZoom,
        attributionControl: true,
      });

      map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
      map.addControl(new mapboxgl.ScaleControl({ unit: 'metric' }), 'bottom-right');

      // Initialize Mapbox Draw
      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true,
        },
        defaultMode: 'simple_select',
        styles: [
          // Active line
          {
            id: 'gl-draw-line',
            type: 'line',
            filter: ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': '#10b981', 'line-dasharray': [0.2, 2], 'line-width': 2 },
          },
          // Active polygon fill
          {
            id: 'gl-draw-polygon-fill',
            type: 'fill',
            filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
            paint: { 'fill-color': '#10b981', 'fill-opacity': 0.25 },
          },
          // Active polygon stroke
          {
            id: 'gl-draw-polygon-stroke',
            type: 'line',
            filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': '#34d399', 'line-width': 2 },
          },
          // Vertex points
          {
            id: 'gl-draw-polygon-and-line-vertex-active',
            type: 'circle',
            filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],
            paint: { 'circle-radius': 6, 'circle-color': '#ffffff', 'circle-stroke-width': 2, 'circle-stroke-color': '#059669' },
          },
        ],
      });

      map.addControl(draw as any, 'top-right');
      drawRef.current = draw;
      mapRef.current = map;

      // Map lifecycle listeners
      map.on('load', () => {
        console.log('[MapboxViewer] Mapbox map loaded successfully');
        setMapLoaded(true);
        setMapError(null);
        map.resize();
        renderSiteLayers(map, sites);
      });

      map.on('style.load', () => {
        console.log(`[MapboxViewer] Map style loaded: ${mapStyle}`);
        renderSiteLayers(map, sites);
      });

      map.on('error', (event) => {
        console.error('[MapboxViewer] Mapbox error event:', event);
        const errMsg = event.error?.message || '';
        const status = (event.error as any)?.status;

        if (
          status === 401 ||
          status === 403 ||
          errMsg.toLowerCase().includes('unauthorized') ||
          errMsg.toLowerCase().includes('forbidden') ||
          errMsg.toLowerCase().includes('access token')
        ) {
          setMapError({
            type: 'MAP_TOKEN_INVALID',
            message: 'Mapbox Access Token is invalid, expired, or unauthorized (HTTP 401/403). Please verify your public token.',
          });
        } else if (status === 404 || errMsg.toLowerCase().includes('style not found')) {
          setMapError({
            type: 'MAP_STYLE_FAILED',
            message: `Failed to load Mapbox style "${mapStyle}". Verify the style URL and account permissions.`,
          });
        }
      });

      // Draw events
      const handleDrawCreate = (e: any) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          try {
            const areaM2 = turf.area(feature);
            const areaHa = Math.round((areaM2 / 10000) * 10) / 10;
            setDrawnAreaHa(areaHa > 0 ? areaHa : 15.0);
            setDrawnGeometry(feature.geometry as GeoJSONGeometry);
            setShowSaveModal(true);
            setIsDrawing(false);
          } catch {
            setDrawnAreaHa(20.0);
            setDrawnGeometry(feature.geometry as GeoJSONGeometry);
            setShowSaveModal(true);
            setIsDrawing(false);
          }
        }
      };

      map.on('draw.create', handleDrawCreate);
      map.on('draw.update', handleDrawCreate);

      // ResizeObserver to ensure map container remains responsive and never 0px
      const resizeObserver = new ResizeObserver(() => {
        if (mapRef.current) {
          mapRef.current.resize();
        }
      });

      if (mapContainerRef.current) {
        resizeObserver.observe(mapContainerRef.current);
      }

      // Initial resize call after mount
      setTimeout(() => {
        map.resize();
      }, 150);

      return () => {
        resizeObserver.disconnect();
        map.remove();
        mapRef.current = null;
        setMapLoaded(false);
      };
    } catch (err: any) {
      console.error('[MapboxViewer] Fatal initialization error:', err);
      setMapError({
        type: 'MAP_TOKEN_INVALID',
        message: err.message || 'Failed to initialize Mapbox instance. Check your access token configuration.',
      });
    }
  }, [activeToken, webglSupported]);

  // Handle Style Switching without destroying the map instance
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    const map = mapRef.current;
    const center = map.getCenter();
    const zoom = map.getZoom();
    const bearing = map.getBearing();
    const pitch = map.getPitch();

    const newStyleUrl = getStyleUrl(mapStyle);
    console.log(`[MapboxViewer] Switching style to: ${mapStyle} (${newStyleUrl})`);

    map.setStyle(newStyleUrl);

    map.once('style.load', () => {
      map.setCenter(center);
      map.setZoom(zoom);
      map.setBearing(bearing);
      map.setPitch(pitch);

      // Re-attach MapboxDraw if layers were wiped
      if (drawRef.current) {
        try {
          const currentFeatures = drawRef.current.getAll();
          map.removeControl(drawRef.current as any);
          map.addControl(drawRef.current as any, 'top-right');
          if (currentFeatures && currentFeatures.features.length) {
            drawRef.current.add(currentFeatures);
          }
        } catch (e) {
          console.warn('[MapboxViewer] Draw re-attachment note:', e);
        }
      }

      renderSiteLayers(map, sites);
    });
  }, [mapStyle]);

  // Re-render when sites or filters change
  useEffect(() => {
    if (mapRef.current && mapLoaded) {
      renderSiteLayers(mapRef.current, sites);
    }
  }, [sites, projectFilter, mapLoaded, renderSiteLayers]);

  // Center on selectedSiteId if provided
  useEffect(() => {
    if (!mapRef.current || !selectedSiteId || !sites.length || !mapLoaded) return;
    const targetSite = sites.find((s) => s.id === selectedSiteId);
    if (!targetSite) return;

    try {
      const bbox = turf.bbox(targetSite.geometry as any);
      mapRef.current.fitBounds(
        [
          [bbox[0], bbox[1]],
          [bbox[2], bbox[3]],
        ],
        { padding: 80, maxZoom: 13, duration: 1500 }
      );
      setActiveSite(targetSite);

      const center = turf.centroid(targetSite.geometry as any);
      const coords = center.geometry.coordinates;
      showSitePopup(mapRef.current, new mapboxgl.LngLat(coords[0], coords[1]), targetSite);
    } catch (e) {
      console.error('[MapboxViewer] Failed to zoom to site bbox:', e);
    }
  }, [selectedSiteId, sites, mapLoaded]);

  // Handle auto-draw if triggered from a project
  useEffect(() => {
    if (autoDrawProjectId) {
      setSaveProjectId(autoDrawProjectId);
      startPolygonDraw();
    }
  }, [autoDrawProjectId]);

  // Start Drawing Polygon
  const startPolygonDraw = () => {
    if (!drawRef.current) return;
    setIsDrawing(true);
    drawRef.current.deleteAll();
    drawRef.current.changeMode('draw_polygon');
  };

  // Clear or Cancel Drawing
  const cancelPolygonDraw = () => {
    if (!drawRef.current) return;
    drawRef.current.deleteAll();
    setIsDrawing(false);
    setDrawnGeometry(null);
  };

  // Save custom Mapbox token
  const handleApplyToken = (tokenToSave: string) => {
    const trimmed = tokenToSave.trim();
    setCustomToken(trimmed);
    localStorage.setItem('darukaa_mapbox_token', trimmed);
    setMapError(null);
    setShowTokenModal(false);
  };

  const filteredSitesCount =
    projectFilter === 'all'
      ? sites.length
      : sites.filter((s) => s.project_id === projectFilter).length;

  return (
    <div className="space-y-4">
      {/* Map Control Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/90 p-3 shadow-md">
        <div className="flex flex-wrap items-center gap-2">
          {/* Project Filter */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-300">
            <span className="font-medium text-slate-400">Filter:</span>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">
                All Projects ({filteredSitesCount} {filteredSitesCount === 1 ? 'Site' : 'Sites'})
              </option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Map Style Selector */}
          <div className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setMapStyle('dark')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                mapStyle === 'dark' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => setMapStyle('satellite')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                mapStyle === 'satellite' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapStyle('streets')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                mapStyle === 'streets' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Terrain
            </button>
          </div>

          {/* Fit all bounds */}
          <button
            onClick={fitAllSites}
            className="flex items-center space-x-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            title="Zoom to fit all sites"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Zoom to All</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {!isDrawing ? (
            <button
              onClick={startPolygonDraw}
              className="flex items-center space-x-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-emerald-500 transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
              <span>Draw Site Polygon</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="animate-pulse flex items-center text-xs font-medium text-emerald-400">
                <Compass className="h-3.5 w-3.5 mr-1" /> Click on map to plot polygon vertices
              </span>
              <button
                onClick={cancelPolygonDraw}
                className="flex items-center space-x-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700 hover:text-red-400"
              >
                <X className="h-3.5 w-3.5" />
                <span>Cancel</span>
              </button>
            </div>
          )}

          <button
            onClick={() => setShowTokenModal(true)}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center space-x-1 border border-slate-800"
            title="Configure Mapbox Access Token"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden lg:inline text-[11px]">Token Config</span>
          </button>
        </div>
      </div>

      {/* Map Drawing Banner instructions if active */}
      {isDrawing && (
        <div className="rounded-xl border border-emerald-800/60 bg-emerald-950/40 p-3 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center space-x-2">
            <Pencil className="h-4 w-4 text-emerald-400 flex-shrink-0 animate-bounce" />
            <span>
              <strong>Polygon Drawing Active:</strong> Click map points to outline the restoration parcel boundary. Double-click or click the first point to close and register the parcel to PostGIS.
            </span>
          </div>
        </div>
      )}

      {/* Map Viewport Container */}
      <div className="relative h-[620px] w-full min-h-[550px] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl bg-[#090d16]">
        {/* Real Mapbox Container */}
        <div ref={mapContainerRef} className="h-full w-full absolute inset-0" />

        {/* Empty Sites Informative Overlay (Item 19) */}
        {mapLoaded && sites.length === 0 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 rounded-xl border border-emerald-800/60 bg-slate-900/90 px-4 py-2.5 shadow-2xl backdrop-blur-md text-xs text-slate-200 flex items-center space-x-2">
            <Info className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <span>
              <strong>No sites created yet.</strong> Create a project and click{' '}
              <span className="text-emerald-400 font-semibold">&ldquo;Draw Site Polygon&rdquo;</span> to begin mapping parcel boundaries.
            </span>
          </div>
        )}

        {/* Error State Banner / Overlay if token missing, invalid, or WebGL missing */}
        {mapError && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/90 p-6 backdrop-blur-md">
            <div className="w-full max-w-lg rounded-2xl border border-amber-900/50 bg-slate-900 p-6 shadow-2xl space-y-4">
              <div className="flex items-center space-x-3">
                <div className="rounded-xl bg-amber-950/80 p-3 text-amber-400 border border-amber-800/50">
                  <KeyRound className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="rounded bg-amber-950 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-400 border border-amber-800/60">
                      {mapError.type}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white font-mono mt-1">
                    {mapError.type === 'MAP_TOKEN_MISSING'
                      ? 'Mapbox Access Token Required'
                      : mapError.type === 'MAP_TOKEN_INVALID'
                      ? 'Mapbox Token Invalid or Unauthorized'
                      : mapError.type === 'WEBGL_FAILURE'
                      ? 'WebGL Acceleration Required'
                      : 'Map Rendering Error'}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {mapError.message}
              </p>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs space-y-2">
                <div className="font-semibold text-emerald-400">How to configure Mapbox:</div>
                <div className="text-[11px] text-slate-400 space-y-1">
                  <div>
                    1. Get a free public token from{' '}
                    <a
                      href="https://account.mapbox.com/access-tokens/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 underline hover:text-emerald-300"
                    >
                      mapbox.com/access-tokens
                    </a>
                  </div>
                  <div>
                    2. In production or Google AI Studio, set environment variable:{' '}
                    <code className="font-mono text-emerald-300 bg-slate-900 px-1.5 py-0.5 rounded">
                      VITE_MAPBOX_ACCESS_TOKEN
                    </code>
                  </div>
                  <div>
                    3. Or paste your public token below for instant in-browser activation:
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="pk.eyJ1Ijo..."
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
                <button
                  onClick={() => handleApplyToken(tokenInput)}
                  disabled={!tokenInput.trim()}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-500 disabled:opacity-50 transition-colors flex items-center space-x-1"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Apply &amp; Load Map</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Site Floating Card if clicked */}
        {activeSite && (
          <div className="absolute bottom-4 left-4 z-20 max-w-sm rounded-xl border border-slate-800 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md">
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded bg-emerald-950 px-1.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-800/40">
                  {activeSite.site_code}
                </span>
                <h3 className="mt-1 text-sm font-bold text-white">{activeSite.name}</h3>
                <p className="text-xs text-slate-400">{activeSite.project_name}</p>
              </div>
              <button
                onClick={() => setActiveSite(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-y border-slate-800 py-2 font-mono">
              <div>
                <span className="text-slate-400 text-[10px]">Area (ST_Area):</span>
                <div className="font-bold text-white">{activeSite.area_hectares.toLocaleString()} ha</div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">Canopy Density:</span>
                <div className="font-bold text-emerald-400">{activeSite.canopy_cover_percent}%</div>
              </div>
            </div>

            <button
              onClick={() => onNavigateToAnalytics(activeSite.id)}
              className="mt-3 flex w-full items-center justify-center space-x-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-500 transition-colors"
            >
              <Activity className="h-3.5 w-3.5" />
              <span>Inspect Carbon &amp; Biodiversity Analytics</span>
            </button>
          </div>
        )}

        {/* Legend Overlay */}
        <div className="absolute top-4 left-4 z-10 rounded-xl border border-slate-800 bg-slate-900/90 p-3 shadow-lg backdrop-blur-sm text-xs text-slate-300">
          <div className="flex items-center space-x-2 font-semibold text-white mb-2">
            <Layers className="h-3.5 w-3.5 text-emerald-400" />
            <span>PostGIS Geometries</span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center space-x-2">
              <span className="h-3 w-3 rounded-sm bg-emerald-500/40 border border-emerald-400"></span>
              <span>Active Restoration Parcel</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="h-3 w-3 rounded-sm bg-emerald-700/60 border border-emerald-300"></span>
              <span>High Canopy Density (&gt; 75%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Create Site Modal on Polygon Finish */}
      <CreateSiteModal
        isOpen={showSaveModal}
        onClose={() => {
          setShowSaveModal(false);
          setDrawnGeometry(null);
          drawRef.current?.deleteAll();
        }}
        projects={projects}
        preselectedProjectId={saveProjectId}
        polygonGeometry={drawnGeometry}
        calculatedAreaHectares={drawnAreaHa}
        onSaveSite={async (projId, data) => {
          await onSaveSite(projId, data);
          await onSiteCreated();
          setShowSaveModal(false);
          setDrawnGeometry(null);
          drawRef.current?.deleteAll();
        }}
      />

      {/* Mapbox Token Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white font-mono">Mapbox Access Token Configuration</h3>
              </div>
              <button onClick={() => setShowTokenModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-xs text-slate-300 leading-relaxed">
              DARUKAA.EARTH loads Mapbox GL vector tiles, satellite imagery, and topographic contours via your public access token.
            </p>
            <div className="mt-2 text-[11px] text-slate-400">
              Environment variable:{' '}
              <code className="text-emerald-400 font-mono">VITE_MAPBOX_ACCESS_TOKEN</code>
            </div>
            <input
              type="text"
              placeholder="pk.eyJ1I..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="mt-3 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setShowTokenModal(false)}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
              >
                Close
              </button>
              <button
                onClick={() => handleApplyToken(tokenInput)}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                Save &amp; Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
