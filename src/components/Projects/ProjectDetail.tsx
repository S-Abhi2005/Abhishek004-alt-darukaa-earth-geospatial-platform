import React, { useState, useEffect } from 'react';
import { Project, Site } from '../../types';
import { api } from '../../services/api';
import {
  ArrowLeft,
  MapPin,
  Plus,
  Layers,
  BarChart3,
  Trash2,
  Trees,
  Leaf,
  Calendar,
  Compass,
  AlertCircle,
} from 'lucide-react';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
  onNavigateToMap: (siteId?: string, autoDrawForProjectId?: string) => void;
  onNavigateToAnalytics: (siteId: string) => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  projectId,
  onBack,
  onNavigateToMap,
  onNavigateToAnalytics,
}) => {
  const [project, setProject] = useState<Project | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      const [projData, sitesData] = await Promise.all([
        api.getProject(projectId),
        api.getSites(projectId),
      ]);
      setProject(projData);
      setSites(sitesData);
    } catch (err: any) {
      setError(err.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const handleDeleteSite = async (siteId: string) => {
    if (confirm('Delete this site polygon and all associated telemetry?')) {
      try {
        await api.deleteSite(siteId);
        setSites(sites.filter((s) => s.id !== siteId));
      } catch (err: any) {
        alert(err.message || 'Failed to delete site');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center space-x-2 text-emerald-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
          <span className="text-sm font-medium">Loading project and PostGIS sites...</span>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="rounded-xl border border-red-900/50 bg-red-950/40 p-6 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
        <p className="mt-2 text-sm text-red-200">{error || 'Project not found'}</p>
        <button
          onClick={onBack}
          className="mt-4 inline-flex items-center space-x-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-white hover:bg-slate-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Projects</span>
        </button>
      </div>
    );
  }

  const totalArea = Math.round(sites.reduce((acc, s) => acc + s.area_hectares, 0) * 10) / 10;
  const estimatedCarbon = Math.round(totalArea * 92.5);

  return (
    <div className="space-y-6">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Project Registry</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigateToMap(undefined, project.id)}
            className="flex items-center space-x-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Draw & Add Site</span>
          </button>
        </div>
      </div>

      {/* Project Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-950 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-800/50">
                {project.project_type}
              </span>
              <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                {project.category}
              </span>
              <span className="rounded-full bg-blue-950 px-2.5 py-0.5 text-xs font-medium text-blue-300 border border-blue-800/40">
                {project.status}
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-white font-mono">
              {project.name}
            </h1>

            <div className="mt-2 flex items-center space-x-2 text-xs text-slate-300">
              <MapPin className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span>{project.region}, {project.country}</span>
              <span className="text-slate-600">•</span>
              <span>Standard: <strong className="text-white">{project.standard}</strong></span>
            </div>

            <p className="mt-3 text-xs text-slate-300 max-w-3xl leading-relaxed">
              {project.description || 'No detailed description recorded.'}
            </p>
          </div>
        </div>

        {/* Project Metrics Cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 pt-5 border-t border-slate-800">
          <div className="rounded-lg bg-slate-950/60 p-3">
            <span className="text-[11px] text-slate-400">Total Sites</span>
            <div className="mt-1 flex items-center space-x-1.5 text-lg font-bold font-mono text-white">
              <Layers className="h-4 w-4 text-emerald-400" />
              <span>{sites.length}</span>
            </div>
          </div>

          <div className="rounded-lg bg-slate-950/60 p-3">
            <span className="text-[11px] text-slate-400">Monitored Area</span>
            <div className="mt-1 flex items-center space-x-1.5 text-lg font-bold font-mono text-emerald-400">
              <Compass className="h-4 w-4 text-emerald-400" />
              <span>{totalArea.toLocaleString()} ha</span>
            </div>
          </div>

          <div className="rounded-lg bg-slate-950/60 p-3">
            <span className="text-[11px] text-slate-400">Target Sequestration</span>
            <div className="mt-1 flex items-center space-x-1.5 text-lg font-bold font-mono text-white">
              <Leaf className="h-4 w-4 text-teal-400" />
              <span>{project.target_carbon_offset.toLocaleString()} t</span>
            </div>
          </div>

          <div className="rounded-lg bg-slate-950/60 p-3">
            <span className="text-[11px] text-slate-400">Current Carbon Stock</span>
            <div className="mt-1 flex items-center space-x-1.5 text-lg font-bold font-mono text-teal-300">
              <Trees className="h-4 w-4 text-teal-400" />
              <span>{estimatedCarbon.toLocaleString()} tCO₂e</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sites Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <h2 className="text-lg font-bold text-white font-mono">
              Associated Geographical Sites ({sites.length})
            </h2>
            <p className="text-xs text-slate-400">
              PostGIS polygon parcels mapped with ST_Area and spatial boundary indexing
            </p>
          </div>
          <button
            onClick={() => onNavigateToMap(undefined, project.id)}
            className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Site with Polygon</span>
          </button>
        </div>

        {sites.length === 0 ? (
          <div className="py-12 text-center">
            <Layers className="mx-auto h-10 w-10 text-slate-600" />
            <h4 className="mt-3 text-sm font-semibold text-white">No sites added yet</h4>
            <p className="mt-1 text-xs text-slate-400">
              Draw a polygon on the interactive Mapbox map to establish your first geographical site for this project.
            </p>
            <button
              onClick={() => onNavigateToMap(undefined, project.id)}
              className="mt-4 inline-flex items-center space-x-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
            >
              <Compass className="h-4 w-4" />
              <span>Open Map & Draw Polygon</span>
            </button>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-slate-800/80">
            {sites.map((site) => (
              <div
                key={site.id}
                className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-slate-800/30 px-2 rounded-lg transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40">
                      {site.site_code}
                    </span>
                    <h4 className="text-sm font-bold text-white truncate">{site.name}</h4>
                  </div>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-1">
                    {site.description || 'Geospatial site boundary parcel'}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                    <span>Biome: <strong className="text-slate-300">{site.biome || 'Tropical Rainforest'}</strong></span>
                    <span>•</span>
                    <span>Canopy: <strong className="text-slate-300">{site.canopy_cover_percent}%</strong></span>
                    <span>•</span>
                    <span>Baseline: <strong className="text-slate-300">{site.baseline_year || 2023}</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end space-x-3">
                  <div className="text-right">
                    <span className="block text-sm font-mono font-bold text-white">
                      {site.area_hectares.toLocaleString()} ha
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      Polygon Area (ST_Area)
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onNavigateToMap(site.id)}
                      className="flex items-center space-x-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-700 transition-colors"
                      title="Inspect site on Mapbox"
                    >
                      <Compass className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Map</span>
                    </button>

                    <button
                      onClick={() => onNavigateToAnalytics(site.id)}
                      className="flex items-center space-x-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
                      title="Inspect carbon and biodiversity time series"
                    >
                      <BarChart3 className="h-3.5 w-3.5" />
                      <span>Analytics</span>
                    </button>

                    <button
                      onClick={() => handleDeleteSite(site.id)}
                      className="rounded-lg p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                      title="Delete site"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
