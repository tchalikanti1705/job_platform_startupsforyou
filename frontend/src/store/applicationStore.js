import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const getAuthHeaders = () => {
  const { token } = useAuthStore.getState();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const useApplicationStore = create((set, get) => ({
  applications: [],
  currentApplication: null,
  isLoading: false,
  error: null,
  
  // Get all applications
  getApplications: async (status = null) => {
    set({ isLoading: true, error: null });
    try {
      const params = status ? `?status=${status}` : '';
      const response = await axios.get(
        `${API_URL}/api/applications${params}`,
        { headers: getAuthHeaders(), withCredentials: true }
      );
      
      set({ applications: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return [];
    }
  },
  
  // Create application
  createApplication: async (jobId, notes = null) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        `${API_URL}/api/applications`,
        { job_id: jobId, notes },
        { headers: getAuthHeaders(), withCredentials: true }
      );
      
      // Add to list
      set((state) => ({
        applications: [response.data, ...state.applications],
        isLoading: false
      }));
      
      return { success: true, application: response.data };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to apply';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },
  
  // Update application status
  updateStatus: async (applicationId, status, notes = null, nextStepDate = null) => {
    set({ isLoading: true, error: null });
    try {
      const body = { status };
      if (notes) body.notes = notes;
      if (nextStepDate) body.next_step_date = nextStepDate;
      
      const response = await axios.patch(
        `${API_URL}/api/applications/${applicationId}/status`,
        body,
        { headers: getAuthHeaders(), withCredentials: true }
      );
      
      // Update in list
      set((state) => ({
        applications: state.applications.map(app =>
          app.application_id === applicationId ? { ...app, ...response.data } : app
        ),
        isLoading: false
      }));
      
      return { success: true, application: response.data };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to update status';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },
  
  // Delete application
  deleteApplication: async (applicationId) => {
    try {
      await axios.delete(
        `${API_URL}/api/applications/${applicationId}`,
        { headers: getAuthHeaders(), withCredentials: true }
      );
      
      // Remove from list
      set((state) => ({
        applications: state.applications.filter(app => app.application_id !== applicationId)
      }));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  // Get applications by status (grouped)
  getGroupedApplications: () => {
    const { applications } = get();
    return {
      Applied: applications.filter(app => app.status === 'Applied'),
      Interview: applications.filter(app => app.status === 'Interview'),
      Offer: applications.filter(app => app.status === 'Offer'),
      Rejected: applications.filter(app => app.status === 'Rejected')
    };
  },
  
  // Clear error
  clearError: () => set({ error: null })
}));
