/**
 * Auth API - Authentication related API calls
 */
import apiClient from './client';
import { ENDPOINTS } from './endpoints';

export const authAPI = {
  /**
   * Sign up a new user
   * @param {Object} data - { name, email, password, role }
   */
  signup: async (data) => {
    const response = await apiClient.post(ENDPOINTS.AUTH.SIGNUP, data);
    return response.data;
  },
  
  /**
   * Login with email and password
   * @param {Object} data - { email, password }
   */
  login: async (data) => {
    const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, data);
    return response.data;
  },
  
  /**
   * Logout current user
   */
  logout: async () => {
    const response = await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    return response.data;
  },
  
  /**
   * Get current authenticated user
   */
  getCurrentUser: async () => {
    const response = await apiClient.get(ENDPOINTS.AUTH.ME);
    return response.data;
  },
  
  /**
   * Refresh auth token
   */
  refreshToken: async () => {
    const response = await apiClient.post(ENDPOINTS.AUTH.REFRESH);
    return response.data;
  },
};
