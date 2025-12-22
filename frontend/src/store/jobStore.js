import { create } from 'zustand';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const useJobStore = create((set, get) => ({
  jobs: [],
  recommendedJobs: [],
  startups: [],
  currentJob: null,
  isLoading: false,
  error: null,
  filters: {
    query: '',
    skills: [],
    experience_level: '',
    location: '',
    funding_stage: '',
    remote: null
  },
  sortBy: 'best_match',
  
  // Set filters
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },
  
  // Set sort
  setSortBy: (sortBy) => set({ sortBy }),
  
  // Search jobs
  searchJobs: async (page = 1, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const params = new URLSearchParams();
      
      if (filters.query) params.append('query', filters.query);
      if (filters.skills.length > 0) params.append('skills', filters.skills.join(','));
      if (filters.experience_level) params.append('experience_level', filters.experience_level);
      if (filters.location && filters.location !== 'all') params.append('location', filters.location);
      if (filters.funding_stage) params.append('funding_stage', filters.funding_stage);
      if (filters.remote !== null) params.append('remote', filters.remote);
      params.append('page', page);
      params.append('limit', limit);
      
      const response = await axios.get(`${API_URL}/api/jobs/search?${params.toString()}`);
      
      set({ jobs: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return [];
    }
  },
  
  // Sync jobs from external sources
  syncJobs: async () => {
    try {
      const response = await axios.post(`${API_URL}/api/jobs/sync`);
      return response.data;
    } catch (error) {
      console.error('Failed to sync jobs:', error);
      return { error: error.message };
    }
  },
  
  // Get recommended jobs
  getRecommendedJobs: async (sortBy = 'best_match', page = 1, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const { token } = useAuthStore.getState?.() || {};
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(
        `${API_URL}/api/jobs/recommended?sort_by=${sortBy}&page=${page}&limit=${limit}`,
        { headers, withCredentials: true }
      );
      
      set({ recommendedJobs: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return [];
    }
  },
  
  // Get single job
  getJob: async (jobId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/jobs/${jobId}`);
      set({ currentJob: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },
  
  // Get startups list
  getStartups: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/jobs/startups/list`);
      set({ startups: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return [];
    }
  },
  
  // Get startup jobs
  getStartupJobs: async (company) => {
    try {
      const response = await axios.get(`${API_URL}/api/jobs/startups/${encodeURIComponent(company)}/jobs`);
      return response.data;
    } catch (error) {
      return [];
    }
  },
  
  // Clear current job
  clearCurrentJob: () => set({ currentJob: null }),
  
  // Clear error
  clearError: () => set({ error: null })
}));

// Import auth store for token
import { useAuthStore } from './authStore';
