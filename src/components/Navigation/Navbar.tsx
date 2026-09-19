import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Globe,
  Layers,
  BarChart3,
  FolderKanban,
  LogOut,
  User as UserIcon,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

export type Tab = 'dashboard' | 'projects' | 'map' | 'analytics' | 'profile';

interface NavbarProps {
  currentTab: Tab;
  onSelectTab: (tab: Tab) => void;
  onSeedData: () => void;
  isSeeding?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onSeedData,
  isSeeding = false,
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand identity */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-900/30">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold tracking-tight text-white text-lg font-mono">DARUKAA<span className="text-emerald-400">.EARTH</span></span>
              <span className="hidden sm:inline-block rounded-full bg-emerald-950/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-800/50">
                PostGIS • Mapbox
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Carbon & Biodiversity Geospatial Analytics</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'dashboard'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onSelectTab('projects')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'projects'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FolderKanban className="h-4 w-4" />
            <span>Projects</span>
          </button>

          <button
            onClick={() => onSelectTab('map')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'map'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Geospatial Map</span>
          </button>

          <button
            onClick={() => onSelectTab('analytics')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'analytics'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Site Analytics</span>
          </button>

          <button
            onClick={() => onSelectTab('profile')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'profile'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <UserIcon className="h-4 w-4" />
            <span>Profile</span>
          </button>
        </nav>

        {/* Right side controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onSeedData}
            disabled={isSeeding}
            title="Reset to verified baseline demo dataset"
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700/80 bg-slate-900/90 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-emerald-400 ${isSeeding ? 'animate-spin' : ''}`} />
            <span className="hidden lg:inline text-[11px]">Reset Demo Data</span>
          </button>

          {user && (
            <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-800">
              <button
                type="button"
                onClick={() => onSelectTab('profile')}
                title="View Profile"
                aria-label="View Account Profile"
                className={`group flex items-center space-x-2 rounded-xl p-1.5 pr-2.5 transition-all text-left focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer ${
                  currentTab === 'profile'
                    ? 'bg-emerald-950/80 border border-emerald-500/50 text-white shadow-sm'
                    : 'hover:bg-slate-800/80 border border-transparent text-slate-300 hover:text-white'
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                    currentTab === 'profile'
                      ? 'bg-emerald-600 border border-emerald-400 text-white'
                      : 'bg-slate-800 border border-slate-700 text-emerald-400 group-hover:border-emerald-500/50'
                  }`}
                >
                  <UserIcon className="h-4 w-4" />
                </div>
                <div className="hidden sm:block text-left">
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-medium text-slate-200 group-hover:text-white">{user.full_name}</span>
                    <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">{user.role}</span>
                </div>
              </button>

              <button
                onClick={logout}
                title="Log out"
                aria-label="Log out of session"
                className="rounded-lg p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800/70 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="flex md:hidden border-t border-slate-800/80 px-2 py-1.5 justify-around bg-slate-950">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs ${
            currentTab === 'dashboard' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => onSelectTab('projects')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs ${
            currentTab === 'projects' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <FolderKanban className="h-3.5 w-3.5" />
          <span>Projects</span>
        </button>
        <button
          onClick={() => onSelectTab('map')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs ${
            currentTab === 'map' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Map</span>
        </button>
        <button
          onClick={() => onSelectTab('analytics')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs ${
            currentTab === 'analytics' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          <span>Analytics</span>
        </button>
        <button
          onClick={() => onSelectTab('profile')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs ${
            currentTab === 'profile' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <UserIcon className="h-3.5 w-3.5" />
          <span>Profile</span>
        </button>
      </div>
    </header>
  );
};
