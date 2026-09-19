import React from 'react';
import { Project, Site } from '../../types';
import {
  FolderKanban,
  Layers,
  Trees,
  TrendingUp,
  MapPin,
  ArrowUpRight,
  ShieldCheck,
  Plus,
  Compass,
  Leaf,
  Activity,
} from 'lucide-react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface DashboardOverviewProps {
  projects: Project[];
  sites: Site[];
  onOpenCreateProject: () => void;
  onNavigateToMap: (siteId?: string) => void;
  onNavigateToProject: (projectId: string) => void;
  onNavigateToAnalytics: (siteId: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  projects,
  sites,
  onOpenCreateProject,
  onNavigateToMap,
  onNavigateToProject,
  onNavigateToAnalytics,
}) => {
  const totalArea = Math.round(sites.reduce((acc, s) => acc + s.area_hectares, 0));
  const totalCarbon = Math.round(totalArea * 92.5);
  const avgCanopy = sites.length
    ? Math.round((sites.reduce((acc, s) => acc + (s.canopy_cover_percent || 70), 0) / sites.length) * 10) / 10
    : 0;

  // Chart: Project categories
  const categoryCounts: Record<string, number> = {};
  projects.forEach((p) => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });

  const categoryChartData = {
    labels: Object.keys(categoryCounts),
    datasets: [
      {
        data: Object.values(categoryCounts),
        backgroundColor: [
          'rgba(16, 185, 129, 0.85)',
          'rgba(14, 165, 233, 0.85)',
          'rgba(245, 158, 11, 0.85)',
          'rgba(168, 85, 247, 0.85)',
        ],
        borderColor: '#0f172a',
        borderWidth: 2,
      },
    ],
  };

  // Chart: Site area comparison
  const siteAreaChartData = {
    labels: sites.slice(0, 6).map((s) => s.name.length > 18 ? s.name.slice(0, 16) + '...' : s.name),
    datasets: [
      {
        label: 'Area (Hectares)',
        data: sites.slice(0, 6).map((s) => s.area_hectares),
        backgroundColor: 'rgba(52, 211, 153, 0.75)',
        hoverBackgroundColor: 'rgba(52, 211, 153, 1)',
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center rounded-md bg-emerald-900/50 px-2 py-1 text-xs font-semibold text-emerald-300 border border-emerald-700/50">
                <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Enterprise Platform
              </span>
              <span className="text-xs text-slate-400">SRID: 4326 (WGS 84) • PostGIS Active</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white font-mono">
              Geospatial Operations Hub
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-2xl">
              End-to-end monitoring of nature-based carbon sequestration and habitat biodiversity across verified land parcels.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenCreateProject}
              className="flex items-center space-x-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 hover:bg-emerald-500 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>New Project</span>
            </button>
            <button
              onClick={() => onNavigateToMap()}
              className="flex items-center space-x-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <Compass className="h-4 w-4 text-emerald-400" />
              <span>Interactive Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Monitored Area</span>
            <div className="rounded-lg bg-emerald-950/60 p-2 text-emerald-400 border border-emerald-800/40">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-white">
              {totalArea.toLocaleString()} <span className="text-sm font-normal text-slate-400">ha</span>
            </div>
            <div className="mt-1 flex items-center text-xs text-emerald-400">
              <TrendingUp className="mr-1 h-3.5 w-3.5" />
              <span>Verified across {sites.length} PostGIS polygons</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Carbon Sequestered</span>
            <div className="rounded-lg bg-teal-950/60 p-2 text-teal-400 border border-teal-800/40">
              <Leaf className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-white">
              {totalCarbon.toLocaleString()} <span className="text-sm font-normal text-slate-400">tCO₂e</span>
            </div>
            <div className="mt-1 flex items-center text-xs text-teal-400">
              <Activity className="mr-1 h-3.5 w-3.5" />
              <span>Biomass + Soil Organic Pools</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Projects</span>
            <div className="rounded-lg bg-blue-950/60 p-2 text-blue-400 border border-blue-800/40">
              <FolderKanban className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-white">
              {projects.length}
            </div>
            <div className="mt-1 flex items-center text-xs text-slate-400">
              <span>{projects.filter((p) => p.status === 'Active').length} Active • {projects.filter((p) => p.status === 'Under Verification').length} Under Audit</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Mean Canopy Density</span>
            <div className="rounded-lg bg-amber-950/60 p-2 text-amber-400 border border-amber-800/40">
              <Trees className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-white">
              {avgCanopy}%
            </div>
            <div className="mt-1 flex items-center text-xs text-amber-400">
              <TrendingUp className="mr-1 h-3.5 w-3.5" />
              <span>+6.4% baseline expansion</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Site Area Comparison */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Site Parcel Size Distribution (Hectares)</h2>
              <p className="text-xs text-slate-400">Computed via PostGIS ST_Area projection</p>
            </div>
            <button
              onClick={() => onNavigateToMap()}
              className="flex items-center text-xs text-emerald-400 hover:text-emerald-300 font-medium"
            >
              <span>View all on map</span>
              <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </button>
          </div>
          <div className="h-64">
            <Bar
              data={siteAreaChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: '#1e293b',
                    titleColor: '#ffffff',
                    bodyColor: '#cbd5e1',
                    borderColor: '#334155',
                    borderWidth: 1,
                  },
                },
                scales: {
                  x: {
                    grid: { color: 'rgba(51, 65, 85, 0.3)' },
                    ticks: { color: '#94a3b8', font: { size: 11 } },
                  },
                  y: {
                    grid: { color: 'rgba(51, 65, 85, 0.3)' },
                    ticks: { color: '#94a3b8', font: { size: 11 } },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Project Categories */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Projects by Ecological Category</h2>
            <p className="text-xs text-slate-400 mb-4">Carbon, biodiversity & dual benefit portfolio</p>
            <div className="h-48 flex items-center justify-center">
              <Doughnut
                data={categoryChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: '#cbd5e1', font: { size: 10 }, boxWidth: 12 },
                    },
                    tooltip: {
                      backgroundColor: '#1e293b',
                      titleColor: '#ffffff',
                      bodyColor: '#cbd5e1',
                      borderColor: '#334155',
                      borderWidth: 1,
                    },
                  },
                  cutout: '65%',
                }}
              />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 text-center">
            Standard Certifications: Verra VCS • Plan Vivo • Peatland Code
          </div>
        </div>
      </div>

      {/* Sites & Projects Tables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sites List */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Monitored Geographical Sites</h2>
              <p className="text-xs text-slate-400">Click any site to open real-time telemetry & analytics</p>
            </div>
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300">
              {sites.length} Sites
            </span>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {sites.map((site) => (
              <div
                key={site.id}
                className="group flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/50 p-3 hover:border-emerald-700/60 hover:bg-slate-800/40 transition-all"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-xs font-semibold text-white truncate group-hover:text-emerald-300">
                      {site.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded">
                      {site.site_code}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-400 truncate">
                    {site.project_name || 'Project Site'} • {site.biome || 'Tropical Forest'}
                  </p>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <div className="text-right">
                    <span className="block text-xs font-mono font-medium text-emerald-400">
                      {site.area_hectares.toLocaleString()} ha
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      {site.canopy_cover_percent}% Canopy
                    </span>
                  </div>
                  <button
                    onClick={() => onNavigateToAnalytics(site.id)}
                    className="rounded-lg bg-emerald-950/60 p-1.5 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
                    title="View Analytics"
                  >
                    <Activity className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onNavigateToMap(site.id)}
                    className="rounded-lg bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                    title="View on Map"
                  >
                    <Compass className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects List */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Active Ecological Projects</h2>
              <p className="text-xs text-slate-400">High-integrity conservation and rewilding portfolios</p>
            </div>
            <button
              onClick={onOpenCreateProject}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Project
            </button>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => onNavigateToProject(proj.id)}
                className="cursor-pointer group flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/50 p-3 hover:border-emerald-700/60 hover:bg-slate-800/40 transition-all"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <FolderKanban className="h-4 w-4 text-teal-400 flex-shrink-0" />
                    <span className="text-xs font-semibold text-white truncate group-hover:text-teal-300">
                      {proj.name}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-400 truncate">
                    {proj.country}, {proj.region} • <span className="text-emerald-400">{proj.project_type}</span>
                  </p>
                </div>

                <div className="flex items-center space-x-3 ml-4">
                  <div className="text-right">
                    <span className="inline-block rounded px-2 py-0.5 text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                      {proj.status}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      {proj.sites_count || 0} Sites
                    </span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
