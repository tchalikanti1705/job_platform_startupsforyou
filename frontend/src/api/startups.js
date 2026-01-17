/**
 * Startups API - Startup related API calls
 */
import apiClient from './client';
import { ENDPOINTS } from './endpoints';

export const startupsAPI = {
  /**
   * Create a new startup
   * @param {Object} data - Startup creation data
   */
  create: async (data) => {
    const response = await apiClient.post(ENDPOINTS.STARTUPS.BASE, data);
    return response.data;
  },
  
  /**
   * Get startup by ID
   * @param {string} id - Startup ID
   */
  getById: async (id) => {
    const response = await apiClient.get(ENDPOINTS.STARTUPS.DETAIL(id));
    return response.data;
  },
  
  /**
   * Get current user's startup (for founders)
   */
  getMyStartup: async () => {
    const response = await apiClient.get(ENDPOINTS.STARTUPS.MY_STARTUP);
    return response.data;
  },
  
  /**
   * Update startup
   * @param {string} id - Startup ID
   * @param {Object} data - Update data
   */
  update: async (id, data) => {
    const response = await apiClient.patch(ENDPOINTS.STARTUPS.DETAIL(id), data);
    return response.data;
  },
  
  /**
   * List startups with filters
   * @param {Object} params - Query parameters
   */
  list: async (params = {}) => {
    const response = await apiClient.get(ENDPOINTS.STARTUPS.BASE, { params });
    return response.data;
  },
};
