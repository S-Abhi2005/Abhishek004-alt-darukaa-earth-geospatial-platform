import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navigation/Navbar';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import { DashboardOverview } from './components/Dashboard/DashboardOverview';
import { ProjectList } from './components/Projects/ProjectList';
import { ProjectDetail } from './components/Projects/ProjectDetail';
import { CreateProjectModal } from './components/Projects/CreateProjectModal';
import { MapboxViewer } from './components/Map/MapboxViewer';
import { SiteAnalyticsView } from './components/Analytics/SiteAnalyticsView';
import { ProfileView } from './components/Profile/ProfileView';
import { Project, Site } from './types';
import { api } from './services/api';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export type Tab = 'dashboard' | 'projects' | 'map' | 'analytics' | 'profile';

const getTabFromPath = (): Tab => {
  if (typeof window === 'undefined') return 'dashboard';
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
  if (path === '/profile') return 'profile';
  if (path === '/projects') return 'projects';
  if (path === '/map') return 'map';
  if (path === '/analytics') return 'analytics';
  return 'dashboard';
};

function MainApp() {
  const { isAuthenticated, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const [currentTab, setCurrentTab] = useState<Tab>(getTabFromPath);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedSiteId, setSelectedSiteId] = useState<string | undefined>(undefined);
  const [autoDrawProjectId, setAutoDrawProjectId] = useState<string | undefined>(undefined);

  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const navigateToTab = (tab: Tab) => {
    setSelectedProjectId(null);
    setCurrentTab(tab);
    const targetPath = tab === 'dashboard' ? '/' : `/${tab}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ tab }, '', targetPath);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentTab(getTabFromPath());
      setSelectedProjectId(null);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const loadData = async () => {
    try {
      const [projData, siteData] = await Promise.all([
        api.getProjects(),
        api.getSites(),
      ]);
      setProjects(projData);
      setSites(siteData);
    } catch (err: any) {
      console.error('Failed to load projects/sites:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const res = await api.seedDemoData();
      await loadData();
      showToast(res.message || 'Demo dataset successfully restored to initial baseline!');
    } catch (err: any) {
      showToast(err.message || 'Failed to seed data', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleCreateProject = async (data: Partial<Project>) => {
    const created = await api.createProject(data);
    await loadData();
    showToast(`Project "${created.name}" created successfully!`);
  };

  const handleDeleteProject = async (id: string) => {
    await api.deleteProject(id);
    await loadData();
    if (selectedProjectId === id) {
      setSelectedProjectId(null);
    }
    showToast('Project deleted successfully.');
  };

  const handleSaveSite = async (projectId: string, siteData: any) => {
    const created = await api.createSite(projectId, siteData);
    await loadData();
    showToast(`Site "${created.name}" registered in PostGIS database!`);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-emerald-400">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-emerald-500 border-t-transparent" />
          <span className="text-xs font-mono font-semibold tracking-wider uppercase">
            Initializing DARUKAA.EARTH Platform...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0c111c]">
        {authMode === 'login' ? (
          <LoginForm onSwitchToRegister={() => setAuthMode('register')} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setAuthMode('login')} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c111c] text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={navigateToTab}
        onSeedData={handleSeedData}
        isSeeding={isSeeding}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2 rounded-xl border border-slate-700 bg-slate-900/95 p-3.5 shadow-2xl backdrop-blur-md animate-fade-in text-xs">
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
          )}
          <span className="text-white font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white pl-2">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {selectedProjectId ? (
          <ProjectDetail
            projectId={selectedProjectId}
            onBack={() => setSelectedProjectId(null)}
            onNavigateToMap={(siteId, autoDrawForProject) => {
              setSelectedSiteId(siteId);
              setAutoDrawProjectId(autoDrawForProject);
              navigateToTab('map');
            }}
            onNavigateToAnalytics={(siteId) => {
              setSelectedSiteId(siteId);
              navigateToTab('analytics');
            }}
          />
        ) : currentTab === 'dashboard' ? (
          <DashboardOverview
            projects={projects}
            sites={sites}
            onOpenCreateProject={() => setIsCreateProjectOpen(true)}
            onNavigateToMap={(siteId) => {
              setSelectedSiteId(siteId);
              navigateToTab('map');
            }}
            onNavigateToProject={(projId) => {
              setSelectedProjectId(projId);
            }}
            onNavigateToAnalytics={(siteId) => {
              setSelectedSiteId(siteId);
              navigateToTab('analytics');
            }}
          />
        ) : currentTab === 'projects' ? (
          <ProjectList
            projects={projects}
            onSelectProject={(projId) => setSelectedProjectId(projId)}
            onOpenCreateModal={() => setIsCreateProjectOpen(true)}
            onDeleteProject={handleDeleteProject}
            onNavigateToMap={() => navigateToTab('map')}
          />
        ) : currentTab === 'map' ? (
          <MapboxViewer
            projects={projects}
            sites={sites}
            selectedSiteId={selectedSiteId}
            autoDrawProjectId={autoDrawProjectId}
            onNavigateToAnalytics={(siteId) => {
              setSelectedSiteId(siteId);
              navigateToTab('analytics');
            }}
            onSiteCreated={loadData}
            onSaveSite={handleSaveSite}
          />
        ) : currentTab === 'profile' ? (
          <ProfileView onNavigateToTab={navigateToTab} />
        ) : (
          <SiteAnalyticsView
            sites={sites}
            initialSiteId={selectedSiteId}
            onNavigateToMap={(siteId) => {
              setSelectedSiteId(siteId);
              navigateToTab('map');
            }}
            onBackToDashboard={() => navigateToTab('dashboard')}
          />
        )}
      </main>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
