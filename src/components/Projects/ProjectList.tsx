import React, { useState } from 'react';
import { Project } from '../../types';
import {
  FolderKanban,
  Search,
  Plus,
  MapPin,
  Layers,
  Trees,
  Trash2,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface ProjectListProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onOpenCreateModal: () => void;
  onDeleteProject: (projectId: string) => Promise<void>;
  onNavigateToMap: () => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onSelectProject,
  onOpenCreateModal,
  onDeleteProject,
  onNavigateToMap,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.country.toLowerCase().includes(search.toLowerCase()) ||
      p.region.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesType = typeFilter === 'All' || p.project_type === typeFilter;
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project and all its associated geographical sites?')) {
      setDeletingId(id);
      try {
        await onDeleteProject(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
            Ecological Projects
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage restoration initiatives, land boundaries, and PostGIS parcel linkages
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onNavigateToMap}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <Layers className="h-3.5 w-3.5 text-emerald-400" />
            <span>Map All Sites</span>
          </button>
          <button
            onClick={onOpenCreateModal}
            className="flex items-center space-x-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 rounded-xl border border-slate-800 bg-slate-900/90 p-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name, country, or biome..."
            className="w-full rounded-lg border border-slate-700 bg-slate-800 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Carbon Sequestration">Carbon Sequestration</option>
            <option value="Biodiversity Conservation">Biodiversity Conservation</option>
            <option value="Dual Benefit">Dual Benefit</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
          >
            <option value="All">All Types</option>
            <option value="Reforestation">Reforestation</option>
            <option value="Afforestation">Afforestation</option>
            <option value="Peatland Restoration">Peatland Restoration</option>
            <option value="Blue Carbon / Mangrove">Blue Carbon / Mangrove</option>
            <option value="Agroforestry">Agroforestry</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 p-12 text-center">
          <FolderKanban className="mx-auto h-10 w-10 text-slate-600" />
          <h3 className="mt-3 text-sm font-semibold text-white">No projects found</h3>
          <p className="mt-1 text-xs text-slate-400">
            {search ? 'Try adjusting your search criteria or filters.' : 'Get started by creating your first ecological project.'}
          </p>
          <button
            onClick={onOpenCreateModal}
            className="mt-4 inline-flex items-center space-x-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className="group cursor-pointer flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm hover:border-emerald-700/60 hover:shadow-lg transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-block rounded-full bg-emerald-950/80 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-800/40">
                    {project.project_type}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    {project.status}
                  </span>
                </div>

                <h3 className="mt-3 text-sm font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                  {project.name}
                </h3>
                <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                  {project.description || 'No description provided.'}
                </p>

                <div className="mt-4 flex items-center space-x-1.5 text-xs text-slate-300">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="truncate">{project.region}, {project.country}</span>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-800/80 pt-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-slate-950/50 p-2">
                    <span className="block text-[10px] text-slate-400">Sites</span>
                    <span className="text-xs font-mono font-bold text-white">
                      {project.sites_count || 0}
                    </span>
                  </div>
                  <div className="rounded-lg bg-slate-950/50 p-2">
                    <span className="block text-[10px] text-slate-400">Area</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {project.total_area_hectares ? `${project.total_area_hectares} ha` : '0 ha'}
                    </span>
                  </div>
                  <div className="rounded-lg bg-slate-950/50 p-2">
                    <span className="block text-[10px] text-slate-400">Standard</span>
                    <span className="text-[10px] font-mono font-medium text-slate-300 truncate block">
                      {project.standard.split(' ')[0]}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={(e) => handleDelete(e, project.id)}
                    disabled={deletingId === project.id}
                    title="Delete project"
                    className="rounded-lg p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>

                  <div className="flex items-center space-x-1 text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
                    <span>Manage Sites</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
