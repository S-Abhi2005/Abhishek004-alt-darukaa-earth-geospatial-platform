import { AuthResponse, Project, Site, SiteAnalytics, User } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('darukaa_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = 'An unexpected error occurred';
    try {
      const errorJson = await res.json();
      errorMsg = errorJson.detail || errorJson.message || res.statusText;
    } catch {
      errorMsg = res.statusText || `Request failed with status ${res.status}`;
    }
    throw new ApiError(errorMsg, res.status);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Authentication
  async register(data: { email: string; password: string; full_name: string; organization?: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await handleResponse<AuthResponse>(res);
    localStorage.setItem('darukaa_token', result.access_token);
    return result;
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await handleResponse<AuthResponse>(res);
    localStorage.setItem('darukaa_token', result.access_token);
    return result;
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<User>(res);
  },

  logout(): void {
    localStorage.removeItem('darukaa_token');
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    const res = await fetch(`${API_BASE}/projects`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Project[]>(res);
  },

  async getProject(id: string): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Project>(res);
  },

  async createProject(data: Partial<Project>): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Project>(res);
  },

  async deleteProject(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Sites
  async getSites(projectId?: string): Promise<Site[]> {
    const url = projectId ? `${API_BASE}/projects/${projectId}/sites` : `${API_BASE}/sites`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Site[]>(res);
  },

  async getSite(id: string): Promise<Site> {
    const res = await fetch(`${API_BASE}/sites/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Site>(res);
  },

  async createSite(projectId: string, data: {
    name: string;
    description?: string;
    site_code: string;
    geometry: Site['geometry'];
    area_hectares: number;
    biome?: string;
    canopy_cover_percent?: number;
    baseline_year?: number;
  }): Promise<Site> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/sites`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Site>(res);
  },

  async deleteSite(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/sites/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Analytics
  async getSiteAnalytics(siteId: string): Promise<SiteAnalytics> {
    const res = await fetch(`${API_BASE}/sites/${siteId}/analytics`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<SiteAnalytics>(res);
  },

  // Database Seed / Reset
  async seedDemoData(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/seed`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },
};
