import React, { useState } from 'react';
import { Project, GeoJSONGeometry } from '../../types';
import { X, MapPin, Layers, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CreateSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  preselectedProjectId?: string;
  polygonGeometry: GeoJSONGeometry | null;
  calculatedAreaHectares: number;
  onSaveSite: (projectId: string, siteData: {
    name: string;
    description: string;
    site_code: string;
    geometry: GeoJSONGeometry;
    area_hectares: number;
    biome: string;
    canopy_cover_percent: number;
    baseline_year: number;
  }) => Promise<void>;
}

export const CreateSiteModal: React.FC<CreateSiteModalProps> = ({
  isOpen,
  onClose,
  projects,
  preselectedProjectId,
  polygonGeometry,
  calculatedAreaHectares,
  onSaveSite,
}) => {
  const [projectId, setProjectId] = useState<string>(
    preselectedProjectId || (projects[0]?.id || '')
  );
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [siteCode, setSiteCode] = useState(
    `DKA-GEO-${Math.floor(100 + Math.random() * 900)}`
  );
  const [biome, setBiome] = useState('Tropical Rainforest & Moist Deciduous');
  const [canopyCover, setCanopyCover] = useState('78');
  const [baselineYear, setBaselineYear] = useState('2024');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !polygonGeometry) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Site Name is required');
      return;
    }
    if (!projectId) {
      setError('Please select an ecological project to associate with this site');
      return;
    }

    setLoading(true);
    try {
      await onSaveSite(projectId, {
        name,
        description,
        site_code: siteCode,
        geometry: polygonGeometry,
        area_hectares: calculatedAreaHectares,
        biome,
        canopy_cover_percent: Number(canopyCover) || 75,
        baseline_year: Number(baselineYear) || 2024,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save geographical site');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <div className="rounded-lg bg-emerald-950 p-2 text-emerald-400 border border-emerald-800/40">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-mono">Register PostGIS Geographical Site</h2>
              <p className="text-xs text-slate-400">Save drawn polygon parcel to PostgreSQL database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Spatial summary badge */}
        <div className="mt-4 rounded-xl border border-emerald-800/40 bg-emerald-950/30 p-3 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Valid PostGIS Polygon Captured</span>
          </div>
          <div className="text-right font-mono font-bold text-emerald-400">
            {calculatedAreaHectares.toLocaleString()} Hectares
          </div>
        </div>

        {error && (
          <div className="mt-3 flex items-center space-x-2 rounded-lg border border-red-900/50 bg-red-950/40 p-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300">Associated Project *</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.country})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-300">Site Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Alto Rio Parcel Bravo"
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300">Site Code</label>
              <input
                type="text"
                value={siteCode}
                onChange={(e) => setSiteCode(e.target.value)}
                placeholder="DKA-AMZ-003"
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Boundary characteristics, soil type, and habitat restoration plan..."
              className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-slate-300">Biome</label>
              <input
                type="text"
                value={biome}
                onChange={(e) => setBiome(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300">Canopy Cover (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={canopyCover}
                onChange={(e) => setCanopyCover(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300">Baseline Year</label>
              <input
                type="number"
                value={baselineYear}
                onChange={(e) => setBaselineYear(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Discard Polygon
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-emerald-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving PostGIS Record...' : 'Confirm & Save Site'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
