import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      // Set user directly (for OAuth callback)
      setUser: (user) => {
        set({ user, isAuthenticated: !!user, error: null });
      },
      
      // Set token
      setToken: (token) => {
        set({ token });
      },
      
      // Login with email/password
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${API_URL}/api/auth/login`, {
            email,
            password
          });
          
          const { access_token, user } = response.data;
          
          set({
            user,
            token: access_token,
            isAuthenticated: true,
            isLoading: false
          });
          
          return { success: true, user };
        } catch (error) {
          const message = error.response?.data?.detail || 'Login failed';
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },
      
      // Signup with email/password
      signup: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${API_URL}/api/auth/signup`, {
            name,
            email,
            password
          });
          
          const { access_token, user } = response.data;
          
          set({
            user,
            token: access_token,
            isAuthenticated: true,
            isLoading: false
          });
          
          return { success: true, user };
        } catch (error) {
          const message = error.response?.data?.detail || 'Signup failed';
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },
      
      // Exchange OAuth session_id for session
      exchangeSession: async (sessionId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(
            `${API_URL}/api/auth/session`,
            { session_id: sessionId },
            { withCredentials: true }
          );
          
          const user = response.data;
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false
          });
          
          return { success: true, user };
        } catch (error) {
          const message = error.response?.data?.detail || 'Session exchange failed';
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },
      
      // Check auth status
      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const { token } = get();
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          
          const response = await axios.get(`${API_URL}/api/auth/me`, {
            headers,
            withCredentials: true
          });
          
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false
          });
          
          return { success: true, user: response.data };
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false
          });
          return { success: false };
        }
      },
      
      // Logout
      logout: async () => {
        try {
          await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true });
        } catch (error) {
          // Ignore logout errors
        }
        
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
      },
      
      // Clear error
      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
