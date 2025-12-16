import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const getAuthHeaders = () => {
  const { token } = useAuthStore.getState();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const useProfileStore = create((set, get) => ({
  profile: null,
  resume: null,
  isLoading: false,
  isUploading: false,
  error: null,
  
  // Get profile
  getProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(
        `${API_URL}/api/profile/me`,
        { headers: getAuthHeaders(), withCredentials: true }
      );
      
      set({ profile: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },
  
  // Update profile
  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(
        `${API_URL}/api/profile/me`,
        data,
        { headers: getAuthHeaders(), withCredentials: true }
      );
      
      set({ profile: response.data, isLoading: false });
      return { success: true, profile: response.data };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to update profile';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },
  
  // Upload resume
  uploadResume: async (file) => {
    set({ isUploading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(
        `${API_URL}/api/profile/resume/upload`,
        formData,
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      );
      
      set({ resume: response.data, isUploading: false });
      return { success: true, resume: response.data };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to upload resume';
      set({ error: message, isUploading: false });
      return { success: false, error: message };
    }
  },
  
  // Check resume status
  checkResumeStatus: async (resumeId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/profile/resume/${resumeId}/status`,
        { headers: getAuthHeaders(), withCredentials: true }
      );
      
      set({ resume: response.data });
      return response.data;
    } catch (error) {
      return null;
    }
  },
  
  // Complete onboarding
  completeOnboarding: async () => {
    try {
      await axios.post(
        `${API_URL}/api/profile/me/complete-onboarding`,
        {},
        { headers: getAuthHeaders(), withCredentials: true }
      );
      
      // Update profile
      set((state) => ({
        profile: state.profile ? { ...state.profile, onboarding_completed: true } : null
      }));
      
      // Update auth store user
      const authStore = useAuthStore.getState();
      if (authStore.user) {
        authStore.setUser({ ...authStore.user, onboarding_completed: true });
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  // Clear error
  clearError: () => set({ error: null })
}));
