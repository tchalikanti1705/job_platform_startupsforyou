import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const getAuthHeaders = () => {
  const { token } = useAuthStore.getState();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const useInsightsStore = create((set, get) => ({
  summary: null,
  timeseries: null,
  funnel: null,
  tableData: null,
  isLoading: false,
  error: null,
  timeRange: 'week',
  
  // Set time range
  setTimeRange: (range) => set({ timeRange: range }),
  
  // Get summary
  getSummary: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(
        `${API_URL}/api/insights/summary`,
        { headers: getAuthHeaders(), withCredentials: true }
      );
      
      set({ summary: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },
  
  // Get timeseries
  getTimeseries: async (range = 'week') => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(
        `${API_URL}/api/insights/timeseries?range=${range}`,
        { headers: getAuthHeaders(), withCredentials: true }
      );
      
      set({ timeseries: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },
  
  // Get funnel
  getFunnel: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/insights/funnel`,
        { headers: getAuthHeaders(), withCredentials: true }
      );
      
      set({ funnel: response.data });
      return response.data;
    } catch (error) {
      return null;
    }
  },
  
  // Get table data
  getTableData: async (page = 1, limit = 20) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/insights/table?page=${page}&limit=${limit}`,
        { headers: getAuthHeaders(), withCredentials: true }
      );
      
      set({ tableData: response.data });
      return response.data;
    } catch (error) {
      return null;
    }
  },
  
  // Fetch all insights
  fetchAllInsights: async () => {
    const { timeRange } = get();
    set({ isLoading: true });
    
    await Promise.all([
      get().getSummary(),
      get().getTimeseries(timeRange),
      get().getFunnel(),
      get().getTableData()
    ]);
    
    set({ isLoading: false });
  },
  
  // Clear error
  clearError: () => set({ error: null })
}));
