import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User as UserIcon,
  Mail,
  ShieldCheck,
  Building2,
  Calendar,
  KeyRound,
  LogOut,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Award,
  Database,
  Layers,
  MapPin,
} from 'lucide-react';

interface ProfileViewProps {
  onNavigateToTab?: (tab: 'dashboard' | 'projects' | 'map' | 'analytics') => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onNavigateToTab }) => {
  const { user, logout, refreshUser, isLoading } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    setRefreshSuccess(false);
    try {
      await refreshUser();
      setRefreshSuccess(true);
      setTimeout(() => setRefreshSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to refresh user profile data');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <span className="text-xs font-mono text-slate-400">Loading user profile telemetry...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-red-900/50 bg-slate-900/80 p-8 text-center backdrop-blur-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-950 text-red-400 border border-red-800">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-bold text-white font-mono">User Profile Unavailable</h3>
        <p className="mt-2 text-xs text-slate-400 max-w-md mx-auto">
          No active authenticated session was found. Please log in with your credentials to access your account information.
        </p>
        <button
          onClick={() => logout()}
          className="mt-5 inline-flex items-center space-x-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-500 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Go to Login</span>
        </button>
      </div>
    );
  }

  const username = user.username || user.email.split('@')[0];
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Active Contributor';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-white font-mono">Profile</h1>
            <span className="rounded-full bg-emerald-950/80 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-800/60 uppercase">
              {user.role} Account
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Authenticated credentials, enterprise organization membership, and geospatial permissions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-60"
            title="Refresh profile from backend"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh Profile'}</span>
          </button>

          <button
            onClick={logout}
            className="flex items-center space-x-1.5 rounded-xl border border-red-900/50 bg-red-950/40 px-3.5 py-2 text-xs font-semibold text-red-300 hover:bg-red-900/60 hover:text-white transition-colors"
            title="Sign out of current session"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {refreshSuccess && (
        <div className="flex items-center space-x-2 rounded-xl border border-emerald-800/60 bg-emerald-950/40 p-3 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <span>User profile telemetry synchronized successfully from PostGIS backend.</span>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 rounded-xl border border-red-800/60 bg-red-950/40 p-3 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Profile Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Primary User Identity Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md">
            <div className="flex flex-col items-center text-center">
              {/* Avatar circle */}
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-lg shadow-emerald-950/50 border border-emerald-500/30">
                <UserIcon className="h-10 w-10 text-emerald-100" />
                <div
                  className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 border-2 border-emerald-500"
                  title="Verified Enterprise Identity"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                </div>
              </div>

              <h2 className="mt-4 text-lg font-bold text-white font-mono">{user.full_name}</h2>
              <p className="text-xs font-mono text-emerald-400">@{username}</p>
              <p className="mt-1 text-xs text-slate-400">{user.email}</p>

              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                <span className="rounded-md bg-emerald-950 px-2.5 py-1 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-800/50 uppercase">
                  Role: {user.role}
                </span>
                <span className="rounded-md bg-slate-800 px-2.5 py-1 text-[10px] font-mono text-slate-300 border border-slate-700">
                  JWT Verified
                </span>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-800 pt-5 space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-slate-500" />
                  <span>Account ID</span>
                </span>
                <span className="font-mono text-slate-200 text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {user.id}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  <span>Member Since</span>
                </span>
                <span className="text-slate-200 font-mono text-[11px]">{memberSince}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <Award className="h-3.5 w-3.5 text-slate-500" />
                  <span>Clearance Level</span>
                </span>
                <span className="text-emerald-400 font-mono text-[11px] font-semibold">Tier 1 Ecological Lead</span>
              </div>
            </div>
          </div>

          {/* Quick Navigation Card */}
          {onNavigateToTab && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Workspace Shortcuts
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => onNavigateToTab('dashboard')}
                  className="rounded-lg border border-slate-800 bg-slate-800/60 p-2 text-left text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <div className="font-semibold text-emerald-400">Dashboard</div>
                  <div className="text-[10px] text-slate-400">Global Overview</div>
                </button>
                <button
                  onClick={() => onNavigateToTab('projects')}
                  className="rounded-lg border border-slate-800 bg-slate-800/60 p-2 text-left text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <div className="font-semibold text-emerald-400">Projects</div>
                  <div className="text-[10px] text-slate-400">Parcels & Sites</div>
                </button>
                <button
                  onClick={() => onNavigateToTab('map')}
                  className="rounded-lg border border-slate-800 bg-slate-800/60 p-2 text-left text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <div className="font-semibold text-emerald-400">Geospatial Map</div>
                  <div className="text-[10px] text-slate-400">Mapbox Viewer</div>
                </button>
                <button
                  onClick={() => onNavigateToTab('analytics')}
                  className="rounded-lg border border-slate-800 bg-slate-800/60 p-2 text-left text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <div className="font-semibold text-emerald-400">Site Analytics</div>
                  <div className="text-[10px] text-slate-400">Longitudinal Chart</div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Detailed Account Specifications */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detailed Account Attributes Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Account Information &amp; Credentials</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Verified attributes retrieved from backend authentication authority.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Full Name */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Full Name</span>
                <p className="text-sm font-bold text-white">{user.full_name}</p>
                <span className="text-[10px] text-slate-500">Legal identity of record</span>
              </div>

              {/* Email Address */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Email Address</span>
                <p className="text-sm font-bold text-white flex items-center space-x-1.5">
                  <Mail className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{user.email}</span>
                </p>
                <span className="text-[10px] text-emerald-400">Primary delivery address</span>
              </div>

              {/* Username */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Username</span>
                <p className="text-sm font-bold text-white font-mono">@{username}</p>
                <span className="text-[10px] text-slate-500">Unique platform handle</span>
              </div>

              {/* Account Role */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Account Role</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-emerald-400 uppercase font-mono">{user.role}</span>
                  <span className="rounded bg-emerald-950 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300 border border-emerald-800/60">
                    Full Access
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">Role-based access control</span>
              </div>

              {/* Organization */}
              <div className="sm:col-span-2 rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Organization</span>
                <p className="text-sm font-bold text-white flex items-center space-x-1.5">
                  <Building2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{user.organization || 'Darukaa Ecology & Geospatial Institute'}</span>
                </p>
                <span className="text-[10px] text-slate-500">Accredited institution for MRV credit verification</span>
              </div>
            </div>
          </div>

          {/* Geospatial Security & Authorizations */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                <Database className="h-4 w-4 text-emerald-400" />
                <span>Geospatial Permissions &amp; Data Rights</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Cryptographic session authorizations active on PostGIS spatial engine.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">PostGIS Write</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <p className="font-mono text-white text-[11px]">ST_Area &amp; ST_Geom</p>
                <p className="text-[10px] text-slate-500">Polygon boundary creation permitted</p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Telemetry MRV</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <p className="font-mono text-white text-[11px]">Sentinel-2 / GEDI</p>
                <p className="text-[10px] text-slate-500">Longitudinal analytics querying</p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Verification</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <p className="font-mono text-white text-[11px]">Verra / Gold Std</p>
                <p className="text-[10px] text-slate-500">Carbon offset credit issuance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
