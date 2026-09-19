import React, { useState, useEffect } from 'react';
import { Site, SiteAnalytics } from '../../types';
import { api } from '../../services/api';
import {
  Activity,
  Trees,
  Leaf,
  Layers,
  TrendingUp,
  ShieldCheck,
  Compass,
  ArrowLeft,
  Calendar,
  Award,
  AlertCircle,
  BarChart2,
  PieChart,
} from 'lucide-react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SiteAnalyticsViewProps {
  sites: Site[];
  initialSiteId?: string;
  onNavigateToMap: (siteId: string) => void;
  onBackToDashboard: () => void;
}

export const SiteAnalyticsView: React.FC<SiteAnalyticsViewProps> = ({
  sites,
  initialSiteId,
  onNavigateToMap,
  onBackToDashboard,
}) => {
  const [selectedSiteId, setSelectedSiteId] = useState<string>(
    initialSiteId || (sites[0]?.id || '')
  );
  const [analytics, setAnalytics] = useState<SiteAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChartTab, setActiveChartTab] = useState<'ndvi' | 'carbon' | 'soil' | 'biodiversity'>('ndvi');

  useEffect(() => {
    if (initialSiteId) {
      setSelectedSiteId(initialSiteId);
    } else if (!selectedSiteId && sites.length > 0) {
      setSelectedSiteId(sites[0].id);
    }
  }, [initialSiteId, sites]);

  useEffect(() => {
    if (!selectedSiteId) return;

    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getSiteAnalytics(selectedSiteId);
        setAnalytics(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load telemetry analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedSiteId]);

  if (!sites.length) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-12 text-center">
        <Activity className="mx-auto h-12 w-12 text-slate-600" />
        <h3 className="mt-4 text-base font-bold text-white">No Sites Available</h3>
        <p className="mt-1 text-xs text-slate-400">
          Create an ecological project and draw your first site polygon on the map to unlock telemetry.
        </p>
        <button
          onClick={onBackToDashboard}
          className="mt-4 inline-flex items-center space-x-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
        >
          <span>Return to Dashboard</span>
        </button>
      </div>
    );
  }

  // Chart configuration: NDVI & Canopy progression
  const ndviChartData = {
    labels: analytics?.historical_performance.map((p) => p.date) || [],
    datasets: [
      {
        label: 'Mean NDVI (Vegetation Index)',
        data: analytics?.historical_performance.map((p) => p.ndvi) || [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        fill: true,
        tension: 0.35,
        yAxisID: 'y',
      },
      {
        label: 'Canopy Density (%)',
        data: analytics?.historical_performance.map((p) => p.canopy_density_percent) || [],
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.05)',
        borderDash: [4, 4],
        tension: 0.3,
        yAxisID: 'y1',
      },
    ],
  };

  // Chart configuration: Carbon Stock & Biomass progression
  const carbonChartData = {
    labels: analytics?.historical_performance.map((p) => p.date) || [],
    datasets: [
      {
        label: 'Cumulative Carbon Stock (tCO₂e)',
        data: analytics?.historical_performance.map((p) => p.carbon_stock_tco2e) || [],
        borderColor: '#34d399',
        backgroundColor: 'rgba(52, 211, 153, 0.2)',
        fill: true,
        tension: 0.3,
        yAxisID: 'y',
      },
      {
        label: 'Biomass Density (t/ha)',
        data: analytics?.historical_performance.map((p) => p.biomass_density_t_ha) || [],
        borderColor: '#fbbf24',
        backgroundColor: 'rgba(251, 191, 36, 0.05)',
        borderDash: [3, 3],
        tension: 0.3,
        yAxisID: 'y1',
      },
    ],
  };

  // Chart: Carbon Pools Doughnut
  const carbonPoolsChartData = {
    labels: analytics?.carbon_breakdown_by_pool.map((c) => c.pool) || [],
    datasets: [
      {
        data: analytics?.carbon_breakdown_by_pool.map((c) => c.tco2e) || [],
        backgroundColor: [
          'rgba(16, 185, 129, 0.9)',
          'rgba(14, 165, 233, 0.9)',
          'rgba(245, 158, 11, 0.9)',
          'rgba(168, 85, 247, 0.9)',
        ],
        borderColor: '#0f172a',
        borderWidth: 2,
      },
    ],
  };

  // Chart: Biodiversity Taxa
  const biodiversityTaxaChartData = {
    labels: analytics?.biodiversity_breakdown.map((b) => b.taxa.split('(')[0].trim()) || [],
    datasets: [
      {
        label: 'Species Count Monitored',
        data: analytics?.biodiversity_breakdown.map((b) => b.count) || [],
        backgroundColor: 'rgba(52, 211, 153, 0.8)',
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Top Selector & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </button>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-300">Selected Site:</span>
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-white focus:border-emerald-500 focus:outline-none"
            >
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.site_code}) - {s.area_hectares} ha
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={() => onNavigateToMap(selectedSiteId)}
          className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-slate-700 transition-colors"
        >
          <Compass className="h-3.5 w-3.5" />
          <span>Locate Parcel on Mapbox</span>
        </button>
      </div>

      {loading ? (
        <div className="flex h-72 items-center justify-center">
          <div className="flex items-center space-x-2 text-emerald-400">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
            <span className="text-sm font-medium">Computing PostGIS telemetry and historical trajectories...</span>
          </div>
        </div>
      ) : error || !analytics ? (
        <div className="rounded-xl border border-red-900/50 bg-red-950/40 p-6 text-center text-xs text-red-300">
          <AlertCircle className="mx-auto h-8 w-8 text-red-400 mb-2" />
          <span>{error || 'Could not load site analytics'}</span>
        </div>
      ) : (
        <>
          {/* Site Overview Header */}
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 p-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="rounded bg-emerald-950 px-2 py-0.5 text-xs font-mono font-bold text-emerald-400 border border-emerald-800/40">
                    {analytics.site_name}
                  </span>
                  <span className="text-xs text-slate-400">
                    Project: <strong className="text-slate-200">{analytics.project_name}</strong>
                  </span>
                </div>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-white font-mono">
                  Carbon Stock & Biodiversity Performance
                </h1>
                <p className="mt-1 text-xs text-slate-300">
                  24-month verified time-series monitoring parcel health, canopy recovery, and biomass accretion.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center rounded-lg bg-emerald-950/80 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-700/50">
                  <ShieldCheck className="mr-1.5 h-4 w-4 text-emerald-400" />
                  {analytics.summary_kpis.verification_status}
                </span>
                <span className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-300">
                  {analytics.summary_kpis.carbon_credit_vintage}
                </span>
              </div>
            </div>

            {/* Summary KPI Cards */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 pt-5 border-t border-slate-800">
              <div className="rounded-xl bg-slate-950/60 p-3">
                <span className="text-[10px] text-slate-400 block">Total Carbon Stock</span>
                <div className="mt-1 text-base font-bold font-mono text-emerald-400">
                  {analytics.summary_kpis.total_carbon_stock_tco2e.toLocaleString()}
                  <span className="text-[10px] font-normal text-slate-400 ml-1">tCO₂e</span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-950/60 p-3">
                <span className="text-[10px] text-slate-400 block">Annual Sequestration</span>
                <div className="mt-1 text-base font-bold font-mono text-white">
                  {analytics.summary_kpis.annual_sequestration_rate_t_yr.toLocaleString()}
                  <span className="text-[10px] font-normal text-slate-400 ml-1">t/yr</span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-950/60 p-3">
                <span className="text-[10px] text-slate-400 block">Current NDVI</span>
                <div className="mt-1 text-base font-bold font-mono text-emerald-400">
                  {analytics.summary_kpis.current_ndvi}
                  <span className="text-[10px] font-semibold text-emerald-500 ml-1">
                    (+{analytics.summary_kpis.ndvi_growth_pct}%)
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-950/60 p-3">
                <span className="text-[10px] text-slate-400 block">Canopy Density</span>
                <div className="mt-1 text-base font-bold font-mono text-white">
                  {analytics.summary_kpis.tree_canopy_cover_pct}%
                </div>
              </div>

              <div className="rounded-xl bg-slate-950/60 p-3">
                <span className="text-[10px] text-slate-400 block">Shannon Index (H')</span>
                <div className="mt-1 text-base font-bold font-mono text-teal-300">
                  {analytics.summary_kpis.shannon_biodiversity_index}
                </div>
              </div>

              <div className="rounded-xl bg-slate-950/60 p-3">
                <span className="text-[10px] text-slate-400 block">Taxa Monitored</span>
                <div className="mt-1 text-base font-bold font-mono text-white">
                  {analytics.summary_kpis.species_monitored_count}
                  <span className="text-[10px] font-normal text-slate-400 ml-1">taxa</span>
                </div>
              </div>
            </div>
          </div>

          {/* Time Series Charts Container */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800 gap-3">
              <div>
                <h3 className="text-base font-bold text-white font-mono">
                  Longitudinal Performance Over Time (24-Month Trajectory)
                </h3>
                <p className="text-xs text-slate-400">
                  Multispectral indices harmonized from Copernicus Sentinel-2 & GEDI LiDAR biomass telemetry
                </p>
              </div>

              <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActiveChartTab('ndvi')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeChartTab === 'ndvi'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  NDVI & Canopy
                </button>
                <button
                  onClick={() => setActiveChartTab('carbon')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeChartTab === 'carbon'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Carbon & Biomass
                </button>
              </div>
            </div>

            <div className="mt-4 h-80">
              {activeChartTab === 'ndvi' ? (
                <Line
                  data={ndviChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: { color: '#e2e8f0', font: { size: 11 } },
                      },
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
                        grid: { color: 'rgba(51, 65, 85, 0.2)' },
                        ticks: { color: '#94a3b8', font: { size: 10 } },
                      },
                      y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: { display: true, text: 'NDVI (0 - 1)', color: '#10b981' },
                        grid: { color: 'rgba(51, 65, 85, 0.3)' },
                        ticks: { color: '#10b981' },
                        min: 0.3,
                        max: 1.0,
                      },
                      y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: { display: true, text: 'Canopy Density (%)', color: '#0ea5e9' },
                        grid: { drawOnChartArea: false },
                        ticks: { color: '#0ea5e9' },
                        min: 0,
                        max: 100,
                      },
                    },
                  }}
                />
              ) : (
                <Line
                  data={carbonChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: { color: '#e2e8f0', font: { size: 11 } },
                      },
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
                        grid: { color: 'rgba(51, 65, 85, 0.2)' },
                        ticks: { color: '#94a3b8', font: { size: 10 } },
                      },
                      y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: { display: true, text: 'Total Carbon Stock (tCO₂e)', color: '#34d399' },
                        grid: { color: 'rgba(51, 65, 85, 0.3)' },
                        ticks: { color: '#34d399' },
                      },
                      y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: { display: true, text: 'Biomass Density (t/ha)', color: '#fbbf24' },
                        grid: { drawOnChartArea: false },
                        ticks: { color: '#fbbf24' },
                      },
                    },
                  }}
                />
              )}
            </div>
          </div>

          {/* Detailed Breakdown Grids */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Carbon Pools Distribution */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">Carbon Stock by Ecological Pool</h3>
                  <p className="text-xs text-slate-400">Above-ground, root biomass, and soil organic carbon</p>
                </div>
                <div className="rounded-lg bg-emerald-950 p-1.5 text-emerald-400 border border-emerald-800/40">
                  <Leaf className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="h-52">
                  <Doughnut
                    data={carbonPoolsChartData}
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
                      cutout: '60%',
                    }}
                  />
                </div>

                <div className="space-y-2.5">
                  {analytics.carbon_breakdown_by_pool.map((pool, idx) => (
                    <div key={idx} className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/80">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-medium truncate">{pool.pool.split('(')[0]}</span>
                        <span className="font-mono font-bold text-emerald-400">{pool.percentage}%</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {pool.tco2e.toLocaleString()} tCO₂e
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Biodiversity Status by Taxa */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">Biodiversity & Species Conservation</h3>
                  <p className="text-xs text-slate-400">Taxonomic monitoring across ecological trophic levels</p>
                </div>
                <div className="rounded-lg bg-teal-950 p-1.5 text-teal-400 border border-teal-800/40">
                  <Trees className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-4 space-y-2.5">
                {analytics.biodiversity_breakdown.map((bio, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg bg-slate-950/60 p-3 border border-slate-800/80"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">{bio.taxa}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        {bio.count} endemic species cataloged
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                        bio.status === 'Critically Endangered'
                          ? 'bg-red-950 text-red-300 border-red-800/50'
                          : bio.status === 'Endangered'
                          ? 'bg-amber-950 text-amber-300 border-amber-800/50'
                          : bio.status === 'Vulnerable'
                          ? 'bg-yellow-950 text-yellow-300 border-yellow-800/50'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-800/50'
                      }`}
                    >
                      {bio.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
